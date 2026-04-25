import { Feedback, FeedbackFormData, FeedbackComment } from './index';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export const feedbackApi = {
  // Feedback
  getFeedback: async (): Promise<Feedback[]> => {
    const response = await axios.get(`${API_URL}/feedback`);
    return response.data;
  },

  getFeedbackById: async (id: string): Promise<Feedback> => {
    const response = await axios.get(`${API_URL}/feedback/${id}`);
    return response.data;
  },

  createFeedback: async (data: FeedbackFormData): Promise<Feedback> => {
    const response = await axios.post(`${API_URL}/feedback`, data);
    return response.data;
  },

  updateFeedback: async (id: string, data: Partial<FeedbackFormData>): Promise<Feedback> => {
    const response = await axios.put(`${API_URL}/feedback/${id}`, data);
    return response.data;
  },

  updateFeedbackStatus: async (id: string, status: Feedback['status']): Promise<Feedback> => {
    const response = await axios.patch(`${API_URL}/feedback/${id}/status`, { status });
    return response.data;
  },

  assignFeedback: async (id: string, assignedToId: string): Promise<Feedback> => {
    const response = await axios.patch(`${API_URL}/feedback/${id}/assign`, { assignedToId });
    return response.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/feedback/${id}`);
  },

  // Comments
  getFeedbackComments: async (feedbackId: string): Promise<FeedbackComment[]> => {
    const response = await axios.get(`${API_URL}/feedback/${feedbackId}/comments`);
    return response.data;
  },

  addFeedbackComment: async (feedbackId: string, content: string, isInternal: boolean = false): Promise<FeedbackComment> => {
    const response = await axios.post(`${API_URL}/feedback/${feedbackId}/comments`, {
      content,
      isInternal
    });
    return response.data;
  },

  // Analytics
  getFeedbackStats: async () => {
    const response = await axios.get(`${API_URL}/feedback/stats`);
    return response.data;
  },
};
