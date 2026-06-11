import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function getAcademicYears() {
  return apiRequest('/academic-years');
}

export async function getActiveAcademicYear() {
  return apiRequest('/academic-years/active');
}

export async function addAcademicYear(year) {
  return apiRequest('/academic-years', {
    method: 'POST',
    body: JSON.stringify(year),
  });
}

export async function activateAcademicYear(id) {
  return apiRequest(`/academic-years/${id}/activate`, {
    method: 'PATCH',
  });
}

export async function updateAcademicYear(id, updates) {
  return apiRequest(`/academic-years/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}
