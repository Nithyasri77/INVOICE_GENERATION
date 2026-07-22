/**
 * Purpose: Single configured Axios instance — every service file imports this, never axios directly
 * Responsibilities: Base URL from env, default headers, and a response interceptor that unwraps
 *                    `{ data }` envelopes and normalizes errors
 * Dependencies: axios
 * Export: axiosClient (default)
 */
import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error normalization — features read error.message, not axios internals
    const message = error.response?.data?.message ?? error.message ?? 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
