import axios from "axios";
import { Feedback, FeedbackFormData, FeedbackComment } from "./index";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

const authHeaders = (token: string | null) => (token ? { Authorization: `Bearer ${token}` } : {});

export const feedbackApi = {
  // Feedback
  getFeedback: async (token: string | null): Promise<Feedback[]> => {
    const response = await axios.get(`${API_URL}/feedback`, {
      headers: authHeaders(token),
    });
    return response.data;
  },

  getFeedbackById: async (token: string | null, id: string): Promise<Feedback> => {
    const response = await axios.get(`${API_URL}/feedback/${id}`, {
      headers: authHeaders(token),
    });
    return response.data;
  },

  createFeedback: async (token: string | null, data: FeedbackFormData): Promise<Feedback> => {
    const response = await axios.post(`${API_URL}/feedback`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  },

  updateFeedback: async (
    token: string | null,
    id: string,
    data: Partial<FeedbackFormData>,
  ): Promise<Feedback> => {
    const response = await axios.put(`${API_URL}/feedback/${id}`, data, {
      headers: authHeaders(token),
    });
    return response.data;
  },

  updateFeedbackStatus: async (
    token: string | null,
    id: string,
    status: Feedback["status"],
  ): Promise<Feedback> => {
    const response = await axios.patch(
      `${API_URL}/feedback/${id}/status`,
      { status },
      {
        headers: authHeaders(token),
      },
    );
    return response.data;
  },

  assignFeedback: async (
    token: string | null,
    id: string,
    assignedToId: string,
  ): Promise<Feedback> => {
    const response = await axios.patch(
      `${API_URL}/feedback/${id}/assign`,
      { assignedToId },
      {
        headers: authHeaders(token),
      },
    );
    return response.data;
  },

  deleteFeedback: async (token: string | null, id: string): Promise<void> => {
    await axios.delete(`${API_URL}/feedback/${id}`, {
      headers: authHeaders(token),
    });
  },

  // Comments
  getFeedbackComments: async (
    token: string | null,
    feedbackId: string,
  ): Promise<FeedbackComment[]> => {
    const response = await axios.get(`${API_URL}/feedback/${feedbackId}/comments`, {
      headers: authHeaders(token),
    });
    return response.data;
  },

  addFeedbackComment: async (
    token: string | null,
    feedbackId: string,
    content: string,
    isInternal: boolean = false,
  ): Promise<FeedbackComment> => {
    const response = await axios.post(
      `${API_URL}/feedback/${feedbackId}/comments`,
      {
        content,
        isInternal,
      },
      {
        headers: authHeaders(token),
      },
    );
    return response.data;
  },

  // Analytics
  getFeedbackStats: async (token: string | null) => {
    const response = await axios.get(`${API_URL}/feedback/stats`, {
      headers: authHeaders(token),
    });
    return response.data;
  },
};
