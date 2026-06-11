import { apiRequest } from '@/core/api/client';

const BASE = '/mailbox';

export async function getMailboxMessages() {
  return apiRequest(BASE);
}

export async function getMailboxMessage(id) {
  return apiRequest(`${BASE}/${id}`);
}

export async function createMailboxMessage(data) {
  return apiRequest(BASE, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateMailboxMessage(id, data) {
  return apiRequest(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteMailboxMessage(id) {
  return apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
}
