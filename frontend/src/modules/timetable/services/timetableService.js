import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

/**
 * Timetable service layer.
 * Encapsulates API calls for timetable module.
 */
export function fetchTimetableList() {
  return apiRequest(API_ENDPOINTS.timetable.list);
}

export function getStudentTimetable() {
  return apiRequest('/timetable/student/me');
}

export async function saveTimetableToDb(grids, { effectiveFrom, effectiveTo }) {
  return apiRequest(API_ENDPOINTS.timetable.publish, {
    method: 'POST',
    body: JSON.stringify({
      grids,
      effectiveFrom,
      effectiveTo,
    }),
  });
}

export async function loadTimetableFromDb() {
  try {
    const tt = await apiRequest(API_ENDPOINTS.timetable.active);
    return tt ? tt.grids : null;
  } catch {
    return null;
  }
}

export async function loadTimetableSettings() {
  return apiRequest(API_ENDPOINTS.timetable.settings);
}

export async function saveTimetableSettings(settings) {
  return apiRequest(API_ENDPOINTS.timetable.settings, {
    method: 'POST',
    body: JSON.stringify(settings),
  });
}

export async function deleteTimetableFromDb(classId) {
  return apiRequest(API_ENDPOINTS.timetable.delete(classId), {
    method: 'DELETE',
  });
}
