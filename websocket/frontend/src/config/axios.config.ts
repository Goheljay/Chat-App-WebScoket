import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/cookies';
import { Navigate } from 'react-router-dom';
import { write } from 'fs';
import localStorageUtil from '../utils/localstorage';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:9001',
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    const token = getAuthToken('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
    return response;
}, (error) => {
    if (error.response.status === 401) {
        removeAuthToken();
        localStorageUtil.clear();
        window.location.href = '/auth/login';
    }
    return Promise.reject(error);
});