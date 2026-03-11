import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Use localhost for local development, change to your actual IP for device testing
    return 'https://legal-tech-hackathon.vercel.app/api';
    //return 'http://10.10.9.226:3001/api';
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
    loginWithWallet: (walletAddress: string) => api.post('/auth/login/wallet', { walletAddress }),
    register: (data: any) => api.post('/auth/register', data)
};

export const licenseApi = {
    verify: (licenseId: string) => api.get(`/licenses/verify/${licenseId}`),
    getByHolder: (address: string) => api.get(`/licenses/business/${address}`),
    register: (data: any) => api.post('/licenses/register', data),
    revoke: (licenseId: string) => api.put(`/licenses/${licenseId}/revoke`),
    suspend: (licenseId: string) => api.put(`/licenses/${licenseId}/suspend`),
    reinstate: (licenseId: string) => api.put(`/licenses/${licenseId}/reinstate`),
};

export const zkApi = {
    createProof: (licenseId: string) => api.post('/licenses/zk/create-proof', { licenseId }),
    verifyProof: (proofHash: string) => api.get(`/licenses/zk/verify/${proofHash}`),
};

export const requestApi = {
    create: (data: any) => api.post('/requests', data),
    getMyRequests: () => api.get('/requests/my-requests'),
    getPending: () => api.get('/requests/pending'),
    approve: (requestId: string, data: any) => api.post(`/requests/${requestId}/approve`, data),
    reject: (requestId: string) => api.post(`/requests/${requestId}/reject`),
};

export default api;