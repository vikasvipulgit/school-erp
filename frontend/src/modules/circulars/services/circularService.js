import { apiRequest } from '@/core/api/client';

const BASE = '/circulars';

export async function getCirculars() {
  return apiRequest(BASE);
}

export async function getCircular(id) {
  return apiRequest(`${BASE}/${id}`);
}

export async function createCircular(data) {
  return apiRequest(BASE, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateCircular(id, data) {
  return apiRequest(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteCircular(id) {
  return apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
}
