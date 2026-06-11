const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
const LOCAL_STORAGE_KEYS_TO_CLEAR = [
  'access_token',
  'refresh_token',
  'user_profile',
  'erp_timetable_rules',
  'erp_working_days',
  'erp_rooms',
  'erp_classes',
  'erp_timetable',
  'erp_period_slots',
];
const SESSION_STORAGE_KEYS_TO_CLEAR = [
  'erp_timetable_prefs',
];

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
  LOCAL_STORAGE_KEYS_TO_CLEAR.forEach((key) => localStorage.removeItem(key));
  SESSION_STORAGE_KEYS_TO_CLEAR.forEach((key) => sessionStorage.removeItem(key));
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

// ─── Public API ──────────────────────────────────────────────────────────────

export const authService = {
  signup: async (name, email, password, role = 'student', teacherId = null) => {
    const data = await post('/auth/register', {
      name, email, password, role,
      ...(teacherId ? { teacherId } : {}),
    });
    saveSession(data);
    return data?.user || null;
  },

  login: async (email, password) => {
    const data = await post('/auth/login', { email, password });
    saveSession(data);
    return data?.user || null;
  },

  studentLogin: async (studentId, password) => {
    const data = await post('/auth/student-login', { studentId, password });
    saveSession(data);
    return data?.user || null;
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
    if (data?.accessToken && data?.refreshToken) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
    }
    return data?.accessToken;
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
    try {
      const raw = localStorage.getItem('user_profile');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  // Calls the callback immediately with the stored user profile
  onAuthChange: (callback) => {
    try {
      const raw = localStorage.getItem('user_profile');
      const user = raw ? JSON.parse(raw) : null;
      callback(user);
    } catch {
      callback(null);
    }
    return () => {}; // no-op unsubscribe
  },
};
