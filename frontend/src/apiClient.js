import axios from 'axios';
import { API_BASE_URL } from './config';

/** Legacy FastAPI client (optional admin / old APIs). Card app uses Supabase. */
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
  if (axios.isAxiosError?.(err)) {
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Server se jawab nahi mila (timeout). API check karo phir dubara try karo.';
    }
    if (!err.response) {
      const base = API_BASE_URL || '(no API_BASE_URL)';
      return `Backend tak connect nahi ho saka (${base}).`;
    }
    const d = err.response?.data?.detail;
    if (typeof d === 'string') return d;
    if (Array.isArray(d)) return d.map((x) => x.msg || JSON.stringify(x)).join(', ') || fallback;
    if (d && typeof d === 'object') return JSON.stringify(d);
    return fallback;
  }

  if (err && typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }
  return fallback;
}
