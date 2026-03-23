/**
 * API Service Layer
 * Handles all backend communication for HireSmart AI
 */

import axios from 'axios';

// Base URL – your machine's local IP (detected via ipconfig)
const BASE_URL = 'http://10.92.22.96:5000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
});

/**
 * Upload resume and get screening prediction
 * @param {object} fileAsset - { uri, name, mimeType }
 * @param {string} role - selected job role
 */
export const predictResume = async (fileAsset, role) => {
  const formData = new FormData();
  formData.append('resume', {
    uri: fileAsset.uri,
    name: fileAsset.name,
    type: fileAsset.mimeType || 'application/octet-stream',
  });
  formData.append('role', role);

  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
  // Expected: { status: "approved"|"rejected", github_username: "optional", skills: [] }
};

/**
 * Verify a GitHub username via backend
 * @param {string} username - GitHub username extracted from resume
 */
export const verifyGitHub = async (username) => {
  const response = await api.post('/verify-github', { github_username: username });
  return response.data;
  // Expected: { github: "valid"|"invalid" }
};
