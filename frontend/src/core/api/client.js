import { authService, getAccessToken } from '@/core/services/authService';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

/**
 * Base API client. Attaches JWT access token and auto-refreshes on 401.
 */
export async function apiRequest(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

  const makeRequest = async (token) => {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        method: 'GET',
        ...options,
        signal: controller.signal,
        headers: {
          ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });
      clearTimeout(timeoutId);
      return res;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out after 15 seconds');
      }
      throw error;
    }
  };

  let token = getAccessToken();
  let response = await makeRequest(token);

  if (response.status === 401) {
    try {
      token = await authService.refreshTokens();
      response = await makeRequest(token);
    } catch {
      // Only redirect + logout when we actually had a session AND are not already
      // on an auth page — prevents the infinite hard-reload loop where
      // AcademicYearContext fires on /login, gets 401, redirects to /login, repeat.
      const onAuthPage = window.location.pathname === '/login' ||
                         window.location.pathname === '/signup';
      if (!onAuthPage) {
        await authService.logout();
        window.location.href = '/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}
