import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * MongoDB Direct Access API Client
 * This client replaces the legacy Supabase implementation.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/**
 * Request Interceptor
 * Automatically attaches the Bearer token to every request if available.
 */
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('visithon_card_token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Standardized Error Message Handler
 * Extracts meaningful error details from the backend response.
 */
export function apiErrorMessage(err, fallback) {
  if (axios.isAxiosError?.(err)) {
    // 1. Connection Refused / Server Offline
    if (!err.response) {
      const base = API_BASE_URL || '(no API_BASE_URL)';
      return `Backend Connection Failed: The server at ${base} is unreachable. Ensure the backend process is running.`;
    }

    // 2. Service Unavailable (MongoDB Connection Failure)
    if (err.response.status === 504 || err.response.status === 503) {
      return "Database Error: The backend is running but cannot connect to MongoDB. Check Atlas IP whitelist and credentials.";
    }

    // 3. Request Timeout
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      return 'Request Timeout: The server took too long to respond. Please try again.';
    }

    // 4. Detailed Backend Errors
    const detail = err.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((x) => x.msg || JSON.stringify(x)).join(', ');
    }
    
    return `Server Error (${err.response.status}): ${fallback}`;
  }

  // Generic JavaScript Errors
  if (err && err.message) {
    return err.message;
  }
  
  return fallback;
}
