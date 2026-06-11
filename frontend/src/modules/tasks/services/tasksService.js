import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export async function createTask(taskData, assignees) {
  let body;
  if (taskData instanceof FormData) {
    body = taskData;
    if (assignees) {
      assignees.forEach((id) => body.append('assignedTo[]', id));
    }
  } else {
    body = JSON.stringify({ ...taskData, assignedTo: assignees });
  }

  const result = await apiRequest(API_ENDPOINTS.tasks.create, {
    method: 'POST',
    body,
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

export async function cancelTaskAll(taskId) {
  return apiRequest(`${API_ENDPOINTS.tasks.get(taskId)}/cancel-all`, { method: 'PATCH' });
}

export async function cancelAssignment(assignmentId) {
  return apiRequest(`${API_ENDPOINTS.tasks.list}/assignments/${assignmentId}/cancel`, { method: 'PATCH' });
}

export async function checkAndMarkOverdueTasks() {
  return apiRequest(API_ENDPOINTS.tasks.markOverdue, { method: 'POST' });
}

export async function getAllAssignmentsWithTasks() {
  return apiRequest(API_ENDPOINTS.tasks.allAssignments);
}
