import { apiRequest, API_ENDPOINTS } from '@/core/api';

/**
 * Attendance service layer.
 * Encapsulates API calls for attendance module.
 */
export function fetchAttendanceList() {
  return apiRequest(API_ENDPOINTS.attendance.list);
}
