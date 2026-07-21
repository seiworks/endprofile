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

export function setAuthToken(token) {
    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common.Authorization;
    }
}
