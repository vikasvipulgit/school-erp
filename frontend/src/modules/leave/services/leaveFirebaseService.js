/**
 * Leave service — replaced Firebase with REST API calls.
 * Function signatures preserved so existing callers need no changes.
 */
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function submitLeaveApplication(data) {
  const result = await apiRequest(API_ENDPOINTS.leave.submit, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function getLeaveApplications() {
  return apiRequest(API_ENDPOINTS.leave.list);
}

export async function getLeaveApplicationsForTeacher(_teacherId) {
  // Backend filters by JWT — param ignored
  return apiRequest(API_ENDPOINTS.leave.list);
}

export async function approveLeave(leaveId, approvedBy) {
  return apiRequest(API_ENDPOINTS.leave.approve(leaveId), { method: 'PATCH' });
}

export async function rejectLeave(leaveId, approvedBy, remarks) {
  return apiRequest(API_ENDPOINTS.leave.reject(leaveId), {
    method: 'PATCH',
    body: JSON.stringify({ remarks }),
  });
}

export async function createProxyAssignment(data) {
  const result = await apiRequest(API_ENDPOINTS.leave.proxy.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.id;
}

export async function getProxyAssignments() {
  return apiRequest(API_ENDPOINTS.leave.proxy.list);
}

export async function approveProxy(proxyId, approvedBy) {
  return apiRequest(API_ENDPOINTS.leave.proxy.approve(proxyId), { method: 'PATCH' });
}

export async function rejectProxy(proxyId, approvedBy) {
  return apiRequest(API_ENDPOINTS.leave.proxy.reject(proxyId), { method: 'PATCH' });
}
