import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// For Android emulator, use 10.0.2.2 instead of localhost
// For web platform, use localhost directly
// Note: In a real app, you would configure this via environment variables or expo configuration
const getBaseUrl = () => {
  return 'http://10.10.9.226:3001/api';
};

const API_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    } catch (e) {
        console.error("Error reading token for request", e);
    }
    return config;
});

export const authApi = {
    login: (email: string, password: string) => api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data)
};

export const licenseApi = {
    verify: (licenseId: string) => api.get(`/licenses/verify/${licenseId}`),
    getByHolder: (address: string) => api.get(`/licenses/business/${address}`),
    register: (data: any) => api.post('/licenses/register', data),
    revoke: (licenseId: string) => api.put(`/licenses/${licenseId}/revoke`)
};

export default api;