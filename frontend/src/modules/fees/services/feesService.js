import { apiRequest, API_ENDPOINTS } from '@/core/api';

/**
 * Fees service layer.
 * Encapsulates API calls for fees module.
 */
export function fetchFeesList() {
  return apiRequest(API_ENDPOINTS.fees.list);
}
