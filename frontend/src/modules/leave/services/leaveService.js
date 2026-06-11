import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function submitLeaveApplication(leaveData) {
  return apiRequest(API_ENDPOINTS.leave.submit, {
    method: 'POST',
    body: JSON.stringify(leaveData),
  });
}

export async function getLeaveApplications() {
  return apiRequest(API_ENDPOINTS.leave.list);
}

export async function getLeaveApplicationsForTeacher() {
  return apiRequest(API_ENDPOINTS.leave.my);
}

export async function getLeaveApplicationsForStudent() {
  return apiRequest(API_ENDPOINTS.leave.my);
}

export async function getLeaveStats() {
  return apiRequest('/leave/stats');
}

export async function approveLeave(leaveId, userId, remarks) {
  // userId is passed for backend context if needed, but backend should use JWT
  return apiRequest(API_ENDPOINTS.leave.approve(leaveId), {
    method: 'PATCH',
    body: JSON.stringify({ approvedBy: userId, remarks }), // Backend will likely use user from JWT
  });
}

export async function rejectLeave(leaveId, userId, remarks) {
  return apiRequest(API_ENDPOINTS.leave.reject(leaveId), {
    method: 'PATCH',
    body: JSON.stringify({ approvedBy: userId, remarks }), // Backend will likely use user from JWT
  });
}

export async function assignProxyBatch(proxyData) {
  return apiRequest(API_ENDPOINTS.leave.proxy.create, {
    method: 'POST',
    body: JSON.stringify(proxyData),
  });
}

export async function getProxyAssignments() {
  return apiRequest(API_ENDPOINTS.leave.proxy.list);
}

export async function approveProxy(proxyId) {
  return apiRequest(API_ENDPOINTS.leave.proxy.approve(proxyId), {
    method: 'PATCH',
  });
}

export async function rejectProxy(proxyId) {
  return apiRequest(API_ENDPOINTS.leave.proxy.reject(proxyId), {
    method: 'PATCH',
  });
}