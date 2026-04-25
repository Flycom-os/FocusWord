export interface Feedback {
  id: string;
  title: string;
  description: string;
  type: 'complaint' | 'suggestion' | 'question' | 'compliment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags: string[];
  attachments: string[];
}

export interface FeedbackFormData {
  title: string;
  description: string;
  type: 'complaint' | 'suggestion' | 'question' | 'compliment';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  userId: string;
  assignedToId?: string;
  tags: string[];
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  content: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  isInternal: boolean;
}
