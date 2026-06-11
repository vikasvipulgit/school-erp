import { apiRequest } from '@/core/api/client';

export const messageService = {
  getConversations: (q = '') => {
    return apiRequest(`/messages/conversations${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  },

  getSentMessages: (q = '') => {
    return apiRequest(`/messages/sent${q ? `?q=${encodeURIComponent(q)}` : ''}`);
  },

  getUnreadCount: () => {
    return apiRequest('/messages/unread-count');
  },

  getConversationDetails: (id) => {
    return apiRequest(`/messages/conversations/${id}`);
  },

  sendMessage: (payload) => {
    return apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  replyMessage: (conversationId, payload) => {
    return apiRequest(`/messages/conversations/${conversationId}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  deleteMessage: (id) => {
    return apiRequest(`/messages/${id}`, {
      method: 'DELETE'
    });
  }
};
