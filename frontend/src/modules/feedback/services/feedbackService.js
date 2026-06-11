import { apiRequest } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';

export const feedbackService = {
  createFeedback: async (data) => {
    return apiRequest(API_ENDPOINTS.feedback.base, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyFeedback: async () => {
    return apiRequest(API_ENDPOINTS.feedback.my);
  },

  getSentFeedback: async () => {
    return apiRequest(API_ENDPOINTS.feedback.sent);
  },

  getFeedbackTeachers: async () => {
    return apiRequest(API_ENDPOINTS.feedback.teachers);
  },

  updateFeedback: async (id, data) => {
    return apiRequest(API_ENDPOINTS.feedback.item(id), {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteFeedback: async (id) => {
    return apiRequest(API_ENDPOINTS.feedback.item(id), {
      method: 'DELETE',
    });
  },
};
