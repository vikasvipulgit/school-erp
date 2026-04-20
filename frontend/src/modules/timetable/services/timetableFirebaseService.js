/**
 * Timetable service — replaced Firebase with REST API calls.
 * Function signatures preserved so existing callers need no changes.
 */
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function saveTimetableToDb(gridsByClass) {
  return apiRequest(API_ENDPOINTS.timetable.publish, {
    method: 'POST',
    body: JSON.stringify({ grids: gridsByClass }),
  });
}

export async function loadTimetableFromDb() {
  try {
    const result = await apiRequest(API_ENDPOINTS.timetable.active);
    return result?.grids || null;
  } catch {
    return null;
  }
}
