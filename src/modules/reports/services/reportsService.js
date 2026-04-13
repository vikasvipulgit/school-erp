import { apiRequest, API_ENDPOINTS } from '@/core/api';

/**
 * Reports service layer.
 * Encapsulates API calls for reports module.
 */
export function fetchReportsList() {
  return apiRequest(API_ENDPOINTS.reports.list);
}
