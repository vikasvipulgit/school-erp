import { auth } from '@/lib/firebase';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

/**
 * Base API client using fetch.
 * Automatically attaches the Firebase ID token as a Bearer token.
 */
export async function apiRequest(path, options = {}) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  const url = `${baseUrl}${path}`;

  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

  const config = {
    method: 'GET',
    headers: {
      ...DEFAULT_HEADERS,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed (${response.status}): ${errorText}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}
