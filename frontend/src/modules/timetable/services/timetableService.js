import { apiRequest, API_ENDPOINTS } from '@/core/api';

/**
 * Timetable service layer.
 * Encapsulates API calls for timetable module.
 */
export function fetchTimetableList() {
  return apiRequest(API_ENDPOINTS.timetable.list);
}
