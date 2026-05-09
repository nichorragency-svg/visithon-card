import axios from 'axios';
import { API_BASE_URL } from './config';

/** Backend calls with timeout so UI does not hang forever if API is down. */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('visithon_card_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function apiErrorMessage(err, fallback) {
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return 'Server se jawab nahi mila (timeout). Pehle backend (port 8000) chalao, phir dubara try karo.';
  }
  if (!err.response) {
    return 'Backend tak connect nahi ho saka. (1) backend folder mein uvicorn chalao (2) npm start dubara chalao — dev mein proxy same PC par 8000 use karti hai.';
  }
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(', ') || fallback;
  if (d && typeof d === 'object') return JSON.stringify(d);
  return fallback;
}
