import { apiRequest, API_ENDPOINTS } from '@/core/api';

/**
 * Tasks service layer.
 * Encapsulates API calls for tasks module.
 */
export function fetchTasksList() {
  return apiRequest(API_ENDPOINTS.tasks.list);
}
