import { apiRequest } from '@/core/api/client';

const BASE = '/achievements';

export async function getAchievements(studentId) {
  const url = studentId ? `${BASE}?studentId=${studentId}` : BASE;
  return apiRequest(url);
}

export async function getAchievement(id) {
  return apiRequest(`${BASE}/${id}`);
}

export async function createAchievement(data) {
  return apiRequest(BASE, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateAchievement(id, data) {
  return apiRequest(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteAchievement(id) {
  return apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
}
