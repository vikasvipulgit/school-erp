/**
 * Tasks service — replaced Firebase with REST API calls.
 * Function signatures preserved so existing callers need no changes.
 */
import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function createTask(taskData, assignees) {
  const result = await apiRequest(API_ENDPOINTS.tasks.create, {
    method: 'POST',
    body: JSON.stringify({ ...taskData, assignedTo: assignees }),
  });
  return { taskId: result.id, assignmentIds: [] };
}

export async function getTasks() {
  return apiRequest(API_ENDPOINTS.tasks.list);
}

export async function getTask(taskId) {
  return apiRequest(API_ENDPOINTS.tasks.get(taskId));
}

export async function getAssignmentsForTask(taskId) {
  return apiRequest(API_ENDPOINTS.tasks.assignments(taskId));
}

export async function getAssignmentsForTeacher(_teacherId) {
  // Backend filters by current user's teacherId from JWT — param ignored
  return apiRequest(API_ENDPOINTS.tasks.myAssignments);
}

export async function updateAssignmentStatus(assignmentId, status) {
  return apiRequest(API_ENDPOINTS.tasks.updateAssignment(assignmentId), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function cancelTask(taskId) {
  return apiRequest(API_ENDPOINTS.tasks.cancel(taskId), { method: 'PATCH' });
}

export async function checkAndMarkOverdueTasks() {
  return apiRequest(API_ENDPOINTS.tasks.markOverdue, { method: 'POST' });
}

export async function getAllAssignmentsWithTasks() {
  return apiRequest(API_ENDPOINTS.tasks.allAssignments);
}
