'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchComments, updateComment, deleteComment, changeCommentStatus } from '@/src/shared/api/comments';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Modal, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './comments.module.css';

export default function CommentsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingComment, setEditingComment] = useState<any>(null);
  const [form, setForm] = useState({
    content: '',
    status: 'pending' as 'pending' | 'approved' | 'rejected'
  });

  useEffect(() => {
    loadComments();
  }, [pagination.page, search, statusFilter]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetchComments(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setComments(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast('Ошибка при загрузке комментариев', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comment: any) => {
    setEditingComment(comment);
    setForm({
      content: comment.content,
      status: comment.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      await updateComment(accessToken, editingComment.id, form);
      showToast('Комментарий обновлен', 'success');
      setShowModal(false);
      loadComments();
    } catch (error) {
      showToast('Ошибка при сохранении комментария', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены что хотите удалить этот комментарий?')) {
      try {
        await deleteComment(accessToken, id);
        showToast('Комментарий удален', 'success');
        loadComments();
      } catch (error) {
        showToast('Ошибка при удалении комментария', 'error');
      }
    }
  };

  const handleStatusChange = async (id: number, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await changeCommentStatus(accessToken, id, status);
      showToast('Статус изменен', 'success');
      loadComments();
    } catch (error) {
      showToast('Ошибка при изменении статуса', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      case 'pending': return styles.pending;
      default: return styles.pending;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрен';
      case 'rejected': return 'Отклонен';
      case 'pending': return 'В ожидании';
      default: return status;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Комментарии</h1>
        <p>Управление комментариями пользователей</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Поиск комментариев..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">Все статусы</option>
            <option value="pending">В ожидании</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Автор</TableHead>
                <TableHead>Комментарий</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell>
                    <div className={styles.author}>
                      {comment.authorName || 'Аноним'}
                      {comment.authorEmail && (
                        <div className={styles.email}>{comment.authorEmail}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={styles.commentContent}>
                      {truncateText(comment.content)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`${styles.status} ${getStatusColor(comment.status)}`}>
                      {getStatusText(comment.status)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button
                        onClick={() => handleEdit(comment)}
                        className={styles.editButton}
                      >
                        ✏️
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comment.id, 'approved')}
                        className={styles.approveButton}
                        title="Одобрить"
                      >
                        ✅
                      </Button>
                      <Button
                        onClick={() => handleStatusChange(comment.id, 'rejected')}
                        className={styles.rejectButton}
                        title="Отклонить"
                      >
                        ❌
                      </Button>
                      <Button
                        onClick={() => handleDelete(comment.id)}
                        className={styles.deleteButton}
                      >
                        🗑️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.limit}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Редактировать комментарий"
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Содержимое</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Текст комментария"
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
              className={styles.select}
            >
              <option value="pending">В ожидании</option>
              <option value="approved">Одобрен</option>
              <option value="rejected">Отклонен</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              Сохранить
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              className={styles.cancelButton}
            >
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
