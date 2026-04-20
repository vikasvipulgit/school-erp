import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export function fetchTasksList() {
  return apiRequest(API_ENDPOINTS.tasks.list);
}
