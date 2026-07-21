import axios from 'axios';

export async function register(payload) {
    const response = await axios.post('/api/auth/register', payload);
    return response.data;
}

export async function login(payload) {
    const response = await axios.post('/api/auth/login', payload);
    return response.data;
}

export function setAuthToken(token) {
    if (token) {
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common.Authorization;
    }
}

