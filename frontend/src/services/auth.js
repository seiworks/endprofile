import axios from 'axios';

const AUTH_TIMEOUT_MS = 8000;

export async function register(payload) {
    const response = await axios.post('/api/auth/register', payload, { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}

export async function login(payload) {
    const response = await axios.post('/api/auth/login', payload, { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}

export async function resetPassword(payload) {
    const response = await axios.post('/api/auth/reset-password', payload, { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}

export async function getRecoveryChallenge(email) {
    const response = await axios.post('/api/auth/recovery-challenge', { email }, { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}

export async function logout() {
    await axios.post('/api/auth/logout');
}

export async function initializeVault(vaultMetadata) {
    const response = await axios.patch('/api/users/vault', { vaultMetadata }, { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}

export async function getCurrentUser() {
    const response = await axios.get('/api/users/me', { timeout: AUTH_TIMEOUT_MS });
    return response.data;
}
