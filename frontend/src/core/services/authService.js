const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

// ─── Token storage ────────────────────────────────────────────────────────────

export function getAccessToken() {
  return localStorage.getItem('access_token');
}

function saveSession(data) {
  localStorage.setItem('access_token', data.accessToken);
  localStorage.setItem('refresh_token', data.refreshToken);
  localStorage.setItem('user_profile', JSON.stringify(data.user));
}

function clearSession() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user_profile');
}

// ─── Internal fetch helpers ───────────────────────────────────────────────────

async function post(path, body, token = null) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(json.message || `HTTP ${res.status}`), json);
  return json;
}

// ─── Public API (same shape as old Firebase authService) ─────────────────────

export const authService = {
  signup: async (name, email, password, role = 'student', teacherId = null) => {
    const data = await post('/auth/register', {
      name, email, password, role,
      ...(teacherId ? { teacherId } : {}),
    });
    saveSession(data);
    return data.user;
  },

  login: async (email, password) => {
    const data = await post('/auth/login', { email, password });
    saveSession(data);
    return data.user;
  },

  logout: async () => {
    const token = getAccessToken();
    if (token) {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    clearSession();
  },

  refreshTokens: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) throw new Error('No refresh token');
    const data = await post('/auth/refresh', { refreshToken });
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data.accessToken;
  },

  changePassword: async (currentPassword, newPassword) => {
    const token = getAccessToken();
    if (!token) throw new Error('Not authenticated');

    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.status === 401) {
      const nextToken = await authService.refreshTokens();
      return authService.changePasswordWithToken(nextToken, currentPassword, newPassword);
    }

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw Object.assign(new Error(json.message || `HTTP ${res.status}`), json);
    }
  },

  changePasswordWithToken: async (token, currentPassword, newPassword) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      throw Object.assign(new Error(json.message || `HTTP ${res.status}`), json);
    }
  },

  getStoredUser: () => {
    const raw = localStorage.getItem('user_profile');
    return raw ? JSON.parse(raw) : null;
  },

  // Mirrors Firebase onAuthStateChanged — calls callback immediately with stored user
  onAuthChange: (callback) => {
    const raw = localStorage.getItem('user_profile');
    const user = raw ? JSON.parse(raw) : null;
    callback(user);
    return () => {}; // no-op unsubscribe
  },
};
