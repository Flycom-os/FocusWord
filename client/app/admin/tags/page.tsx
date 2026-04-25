'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchTags, createTag, updateTag, deleteTag } from '@/src/shared/api/tags';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Modal, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './tags.module.css';

export default function TagsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [tags, setTags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    loadTags();
  }, [pagination.page, search]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await fetchTags(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setTags(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast('Ошибка при загрузке тегов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTag(null);
    setForm({
      name: '',
      slug: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setForm({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingTag) {
        await updateTag(accessToken, editingTag.id, form);
        showToast('Тег обновлен', 'success');
      } else {
        await createTag(accessToken, form);
        showToast('Тег создан', 'success');
      }
      setShowModal(false);
      loadTags();
    } catch (error) {
      showToast('Ошибка при сохранении тега', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены что хотите удалить этот тег?')) {
      try {
        await deleteTag(accessToken, id);
        showToast('Тег удален', 'success');
        loadTags();
      } catch (error) {
        showToast('Ошибка при удалении тега', 'error');
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Теги</h1>
        <p>Управление тегами для постов</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Input
            placeholder="Поиск тегов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleCreate} className={styles.createButton}>
          ➕ Создать тег
        </Button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell>{tag.name}</TableCell>
                  <TableCell>{tag.slug}</TableCell>
                  <TableCell>{tag.description || '-'}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button
                        onClick={() => handleEdit(tag)}
                        className={styles.editButton}
                      >
                        ✏️
                      </Button>
                      <Button
                        onClick={() => handleDelete(tag.id)}
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
        title={editingTag ? 'Редактировать тег' : 'Создать тег'}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Название</label>
            <Input
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название тега"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание тега"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingTag ? 'Сохранить' : 'Создать'}
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
