'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, MessageSquare, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { Feedback } from '@/src/entities/Feedback';
import { feedbackApi } from '@/src/entities/Feedback/api';
import styles from './feedback.module.css';

const FeedbackPage = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const data = await feedbackApi.getFeedback();
      setFeedback(data);
    } catch (error) {
      console.error('Failed to load feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Feedback['status']) => {
    switch (status) {
      case 'open':
        return <MessageSquare size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'resolved':
        return <CheckCircle size={16} />;
      case 'closed':
        return <AlertCircle size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'open':
        return '#3b82f6';
      case 'in_progress':
        return '#f59e0b';
      case 'resolved':
        return '#10b981';
      case 'closed':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      case 'urgent':
        return '#dc2626';
      default:
        return '#10b981';
    }
  };

  const getTypeColor = (type: Feedback['type']) => {
    switch (type) {
      case 'complaint':
        return '#ef4444';
      case 'suggestion':
        return '#3b82f6';
      case 'question':
        return '#f59e0b';
      case 'compliment':
        return '#10b981';
      default:
        return '#3b82f6';
    }
  };

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Feedback & Requests</h1>
        <button className={styles.addButton}>
          <Plus size={20} />
          New Feedback
        </button>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Feedback</h3>
          <p className={styles.statValue}>{feedback.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Open</h3>
          <p className={styles.statValue}>
            {feedback.filter(f => f.status === 'open').length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>In Progress</h3>
          <p className={styles.statValue}>
            {feedback.filter(f => f.status === 'in_progress').length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Resolved</h3>
          <p className={styles.statValue}>
            {feedback.filter(f => f.status === 'resolved').length}
          </p>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select 
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select 
          className={styles.filterSelect}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="complaint">Complaint</option>
          <option value="suggestion">Suggestion</option>
          <option value="question">Question</option>
          <option value="compliment">Compliment</option>
        </select>

        <select 
          className={styles.filterSelect}
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className={styles.feedbackGrid}>
        {filteredFeedback.map((item) => (
          <div key={item.id} className={styles.feedbackCard}>
            <div className={styles.cardHeader}>
              <div className={styles.titleSection}>
                <h3>{item.title}</h3>
                <div className={styles.badges}>
                  <span 
                    className={styles.badge}
                    style={{ backgroundColor: getTypeColor(item.type) + '20', color: getTypeColor(item.type) }}
                  >
                    {item.type}
                  </span>
                  <span 
                    className={styles.badge}
                    style={{ backgroundColor: getPriorityColor(item.priority) + '20', color: getPriorityColor(item.priority) }}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
              <div className={styles.statusSection}>
                <div 
                  className={styles.status}
                  style={{ color: getStatusColor(item.status) }}
                >
                  {getStatusIcon(item.status)}
                  <span>{item.status.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <p className={styles.description}>{item.description}</p>

            <div className={styles.cardFooter}>
              <div className={styles.userInfo}>
                <User size={16} />
                <span>{item.user?.name || 'Unknown User'}</span>
              </div>
              <div className={styles.date}>
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>

            {item.tags.length > 0 && (
              <div className={styles.tags}>
                {item.tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackPage;
