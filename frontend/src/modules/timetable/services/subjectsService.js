import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

let _cache = null;

function mapFromApi(s) {
  return {
    id: s.id,
    name: s.name,
    shortName: s.code || '',
    availability: s.periodsPerWeek || 20,
    difficulty: s.difficulty !== undefined ? s.difficulty : 5,
    classes: s.gradeLevel || [],
  };
}

export async function getSubjects() {
  if (_cache) return [..._cache];
  const list = await apiRequest(API_ENDPOINTS.subjects.list);
  _cache = list.map(mapFromApi);
  return [..._cache];
}

export function invalidateSubjectsCache() {
  _cache = null;
}

export async function addSubject(subject) {
  const payload = {
    name: subject.name,
    code: subject.shortName || subject.name.slice(0, 4).toUpperCase(),
    periodsPerWeek: Number(subject.availability) || 20,
    difficulty: Number(subject.difficulty) || 5,
    gradeLevel: subject.classes || [],
  };
  const result = await apiRequest(API_ENDPOINTS.subjects.create, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  _cache = null;
  return mapFromApi(result);
}

export async function updateSubject(id, updates) {
  const payload = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.shortName !== undefined) payload.code = updates.shortName;
  if (updates.availability !== undefined) payload.periodsPerWeek = Number(updates.availability);
  if (updates.difficulty !== undefined) payload.difficulty = Number(updates.difficulty);
  if (updates.classes !== undefined) payload.gradeLevel = updates.classes;
  const result = await apiRequest(API_ENDPOINTS.subjects.update(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  _cache = null;
  return mapFromApi(result);
}

export async function deleteSubject(id) {
  await apiRequest(API_ENDPOINTS.subjects.remove(id), { method: 'DELETE' });
  _cache = null;
}
