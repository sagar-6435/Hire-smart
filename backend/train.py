"""
HireSmart AI – Model Training Script
-------------------------------------
Place your resume dataset CSV in backend/ as `dataset.csv`
with the following columns:
    - resume_text : str  (full text of the resume)
    - role        : str  (ml_engineer | frontend_developer | backend_developer)
    - label       : int  (1 = shortlisted, 0 = rejected)

Then run:
    python train.py

This will save `model.pkl` which app.py will automatically load.
"""

import os
import pickle
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# ─── Config ───────────────────────────────────────────────────────────────────
DATASET_PATH = "dataset.csv"
MODEL_OUTPUT  = "model.pkl"

# ─── Load dataset ─────────────────────────────────────────────────────────────
print(f"[1/4] Loading dataset from '{DATASET_PATH}'...")
if not os.path.exists(DATASET_PATH):
    raise FileNotFoundError(
        f"Dataset not found at '{DATASET_PATH}'.\n"
        "Create a CSV with columns: resume_text, role, label"
    )

df = pd.read_csv(DATASET_PATH)
print(f"      Loaded {len(df)} samples.")
print(f"      Label distribution:\n{df['label'].value_counts()}")

# ─── Feature engineering ──────────────────────────────────────────────────────
# Combine resume text + role into one feature string
df["features"] = df["resume_text"].fillna("") + " [ROLE] " + df["role"].fillna("")
X = df["features"]
y = df["label"].astype(int)

# ─── Train / test split ───────────────────────────────────────────────────────
print("\n[2/4] Splitting data (80/20)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"      Train: {len(X_train)} | Test: {len(X_test)}")

# ─── Build pipeline ───────────────────────────────────────────────────────────
print("\n[3/4] Training model...")
pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=10000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        stop_words="english",
    )),
    ("clf", LogisticRegression(
        max_iter=1000,
        C=1.0,
        class_weight="balanced",
        random_state=42,
    )),
])

pipeline.fit(X_train, y_train)

# ─── Evaluate ─────────────────────────────────────────────────────────────────
y_pred = pipeline.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n      Accuracy : {acc:.4f}")
print("\n      Classification Report:")
print(classification_report(y_test, y_pred, target_names=["Rejected", "Shortlisted"]))

# ─── Save model ───────────────────────────────────────────────────────────────
print(f"\n[4/4] Saving model to '{MODEL_OUTPUT}'...")
with open(MODEL_OUTPUT, "wb") as f:
    pickle.dump(pipeline, f)

print(f"      ✅ Done! Model saved as '{MODEL_OUTPUT}'")
print(f"         Restart app.py to load the new model.")
