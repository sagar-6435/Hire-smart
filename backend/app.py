"""
HireSmart AI – Flask Backend (with trained RandomForest model)

Model files required in this directory:
    model.pkl        – trained RandomForestClassifier
    role_encoder.pkl – LabelEncoder for job role
    edu_encoder.pkl  – LabelEncoder for education level

Run:
    python app.py
"""

import os
import re
import io
import joblib
import numpy as np
import requests

from flask import Flask, request, jsonify
from flask_cors import CORS

# ─── PDF / DOCX text extraction ───────────────────────────────────────────────
try:
    from pdfminer.high_level import extract_text as extract_pdf_text
    PDF_SUPPORT = True
except ImportError:
    PDF_SUPPORT = False

try:
    import docx
    DOCX_SUPPORT = True
except ImportError:
    DOCX_SUPPORT = False

app = Flask(__name__)
CORS(app)


# ─── Role label map  (app role id → encoder label) ────────────────────────────
# These must match what role_encoder was trained on
ROLE_LABEL_MAP = {
    'ml_engineer':        'ML Engineer',
    'frontend_developer': 'Frontend Developer',
    'backend_developer':  'Backend Developer',
}

# ─── Load all 3 model files ───────────────────────────────────────────────────
def load_artifacts():
    try:
        model        = joblib.load('model.pkl')
        role_encoder = joblib.load('role_encoder.pkl')
        edu_encoder  = joblib.load('edu_encoder.pkl')
        print('[model] ✅ Loaded model.pkl, role_encoder.pkl, edu_encoder.pkl')
        print(f'[model]    Role classes : {list(role_encoder.classes_)}')
        print(f'[model]    Edu  classes : {list(edu_encoder.classes_)}')
        return model, role_encoder, edu_encoder
    except Exception as e:
        print(f'[model] ❌ Could not load model files: {e}')
        print('[model]    Falling back to rule-based prediction.')
        return None, None, None

_model, _role_enc, _edu_enc = load_artifacts()


# ─── Text extraction ──────────────────────────────────────────────────────────
def extract_text(file_obj, filename: str) -> str:
    fname = filename.lower()
    if fname.endswith('.pdf'):
        if PDF_SUPPORT:
            return extract_pdf_text(io.BytesIO(file_obj.read())) or ''
    elif fname.endswith('.docx'):
        if DOCX_SUPPORT:
            doc = docx.Document(io.BytesIO(file_obj.read()))
            return '\n'.join(p.text for p in doc.paragraphs)
    try:
        return file_obj.read().decode('utf-8', errors='ignore')
    except Exception:
        return ''


# ─── Feature extraction from resume text ─────────────────────────────────────

def extract_years_experience(text: str) -> float:
    """Extract years of experience from resume text."""
    patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience\s*(?:of\s*)?(\d+)\+?\s*years?',
        r'(\d+)\+?\s*yrs?\s*(?:of\s*)?exp',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return float(match.group(1))
    return 0.0


def extract_education(text: str, edu_encoder) -> str:
    """
    Extract the highest education level from text.
    Returns the closest matching class from edu_encoder.
    """
    edu_keywords = {
        'phd':        ['phd', 'doctorate', 'ph.d'],
        'master':     ['master', 'msc', 'm.sc', 'mba', 'mtech', 'm.tech', 'me ', 'm.e'],
        'bachelor':   ['bachelor', 'bsc', 'b.sc', 'btech', 'b.tech', 'be ', 'b.e', 'bca', 'bcom', 'bba'],
        'diploma':    ['diploma', 'polytechnic'],
        'highschool': ['high school', 'secondary', '12th', 'hsc', 'ssc', '10th'],
    }
    text_lower = text.lower()
    found = 'bachelor'  # default assumption
    for level, keywords in edu_keywords.items():
        if any(kw in text_lower for kw in keywords):
            found = level
            break

    # Map to encoder's exact classes (case-insensitive best match)
    classes = list(edu_encoder.classes_)
    classes_lower = [c.lower() for c in classes]
    for i, cls_lower in enumerate(classes_lower):
        if found in cls_lower or cls_lower in found:
            return classes[i]
    # Return first class as fallback
    return classes[0] if classes else found


def extract_skills_count(text: str, role: str) -> int:
    """Count role-relevant skills found in resume."""
    role_skills = {
        'ml_engineer': [
            'python','tensorflow','pytorch','keras','scikit-learn','pandas',
            'numpy','deep learning','machine learning','nlp','computer vision',
            'data science','transformers','mlops','airflow','mlflow',
        ],
        'frontend_developer': [
            'react','vue','angular','javascript','typescript','html','css',
            'sass','tailwind','webpack','vite','next.js','redux','graphql',
            'react native','expo','jest','figma',
        ],
        'backend_developer': [
            'node.js','express','django','flask','fastapi','spring','postgresql',
            'mysql','mongodb','redis','docker','kubernetes','aws','gcp','azure',
            'microservices','graphql','kafka','nginx','linux','ci/cd',
        ],
    }
    keywords = role_skills.get(role, [])
    text_lower = text.lower()
    matched = [kw for kw in keywords if kw in text_lower]
    return len(matched), matched


# ─── Prediction ───────────────────────────────────────────────────────────────

def predict_with_model(text: str, role: str) -> dict:
    """
    Use the trained RandomForestClassifier to predict shortlisting.
    Returns dict with: shortlisted (bool), skills (list), match_score (float)
    """
    skills_count, matched_skills = extract_skills_count(text, role)
    total_skills = {'ml_engineer': 16, 'frontend_developer': 18, 'backend_developer': 20}.get(role, 20)
    match_score = round(skills_count / total_skills, 3)

    if _model is None:
        # Rule-based fallback
        print('[predict] Using rule-based fallback (no model loaded)')
        return {
            'shortlisted':       match_score >= 0.40,
            'skills':            matched_skills,
            'skills_match_score': match_score,
        }

    try:
        # Build the feature vector
        role_label = ROLE_LABEL_MAP.get(role, role)
        encoded_role  = _role_enc.transform([role_label])[0]
        education_str = extract_education(text, _edu_enc)
        encoded_edu   = _edu_enc.transform([education_str])[0]
        years_exp     = extract_years_experience(text)

        features = np.array([[encoded_role, encoded_edu, years_exp, skills_count]])
        prediction = _model.predict(features)[0]

        print(f'[predict] role={role_label}, edu={education_str}, '
              f'exp={years_exp}y, skills={skills_count} → {prediction}')

        return {
            'shortlisted':        bool(prediction == 1),
            'skills':             matched_skills,
            'skills_match_score': match_score,
        }

    except Exception as e:
        print(f'[predict] Model prediction error: {e} — using rule-based fallback')
        return {
            'shortlisted':        match_score >= 0.40,
            'skills':             matched_skills,
            'skills_match_score': match_score,
        }


# ─── GitHub username extraction ───────────────────────────────────────────────
GITHUB_PATTERNS = [
    r'github\.com/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})',
    r'github[:\s]+([a-zA-Z0-9-]{1,39})',
    r'@([a-zA-Z0-9-]{1,39})\s*\(github\)',
]

def extract_github_username(text: str):
    for pattern in GITHUB_PATTERNS:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1)
    return None


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'service': 'HireSmart Backend',
        'model_loaded': _model is not None,
    })


@app.route('/predict', methods=['POST'])
def predict():
    """
    POST /predict
    Form data:  resume (file), role (string)
    Response:   { status, github_username, skills, skills_match_score }
    """
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    file = request.files['resume']
    role = request.form.get('role', '')

    if not file.filename:
        return jsonify({'error': 'Empty filename'}), 400

    if role not in ROLE_LABEL_MAP:
        return jsonify({'error': f"Unknown role '{role}'"}), 400

    # Extract text
    text = extract_text(file, file.filename)
    if not text.strip():
        return jsonify({'error': 'Could not extract text from resume'}), 422

    # Run model prediction
    result = predict_with_model(text, role)

    # GitHub
    github_username = extract_github_username(text)

    return jsonify({
        'status':             'approved' if result['shortlisted'] else 'rejected',
        'github_username':    github_username,
        'skills':             result['skills'],
        'skills_match_score': result['skills_match_score'],
    })


@app.route('/verify-github', methods=['POST'])
def verify_github():
    """POST /verify-github  — { github_username } → { github: valid|invalid }"""
    data = request.get_json(silent=True) or {}
    username = data.get('github_username', '').strip()

    if not username:
        return jsonify({'error': 'github_username is required'}), 400

    try:
        resp = requests.get(
            f'https://api.github.com/users/{username}',
            headers={
                'Accept': 'application/vnd.github+json',
                'User-Agent': 'HireSmart-AI/1.0',
            },
            timeout=10,
        )
        if resp.status_code == 200:
            profile = resp.json()
            return jsonify({
                'github':       'valid',
                'profile_url':  profile.get('html_url'),
                'name':         profile.get('name'),
                'public_repos': profile.get('public_repos', 0),
                'followers':    profile.get('followers', 0),
            })
        return jsonify({'github': 'invalid'})

    except requests.exceptions.RequestException as e:
        app.logger.error(f'GitHub API error: {e}')
        return jsonify({'github': 'invalid', 'error': 'GitHub API unreachable'}), 502


# ─── Entry point ──────────────────────────────────────────────────────────────
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    app.run(host='0.0.0.0', port=port, debug=debug)
