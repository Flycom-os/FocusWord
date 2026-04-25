'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { recordsApi, RecordDto } from '@/src/shared/api/records';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import styles from './categories.module.css';

export default function RecordCategoriesPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RecordDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<RecordDto | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    slug: '',
    description: '',
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    loadRecords();
  }, [currentPage, search]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const response = await recordsApi.getAll(currentPage, 10, search);
      setRecords(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      showToast('Ошибка при загрузке категорий', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setCategoryForm({
      title: '',
      slug: '',
      description: '',
      status: 'draft'
    });
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (record: RecordDto) => {
    setCategoryForm({
      title: record.title,
      slug: record.slug,
      description: record.content || '',
      status: record.status
    });
    setEditingCategory(record);
    setShowCreateModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await recordsApi.update(editingCategory.id.toString(), {
          ...categoryForm,
          content: categoryForm.description,
          contentBlocks: [{ type: 'paragraph', data: { text: categoryForm.description } }]
        });
        showToast('Категория обновлена', 'success');
      } else {
        await recordsApi.create({
          ...categoryForm,
          content: categoryForm.description,
          contentBlocks: [{ type: 'paragraph', data: { text: categoryForm.description } }]
        });
        showToast('Категория создана', 'success');
      }
      
      setShowCreateModal(false);
      setEditingCategory(null);
      loadRecords();
    } catch (error) {
      showToast('Ошибка при сохранении категории', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }
    
    try {
      await recordsApi.delete(id);
      showToast('Категория удалена', 'success');
      loadRecords();
    } catch (error) {
      showToast('Ошибка при удалении категории', 'error');
    }
  };

  const handleStatusChange = async (id: string, status: 'draft' | 'published') => {
    try {
      await recordsApi.changeStatus(id, status);
      showToast(`Статус изменен на ${status === 'published' ? 'опубликована' : 'черновик'}`, 'success');
      loadRecords();
    } catch (error) {
      showToast('Ошибка при изменении статуса', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = styles.statusBadge;
    switch (status) {
      case 'published':
        return `${baseClass} ${styles.published}`;
      case 'draft':
        return `${baseClass} ${styles.draft}`;
      default:
        return baseClass;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Опубликована';
      case 'draft':
        return 'Черновик';
      default:
        return status;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Категории записей</h1>
        <p>Управление категориями для записей</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск категорий..."
            className={styles.searchInput}
          />
        </div>
        <Button
          onClick={handleCreateCategory}
          className={styles.createButton}
        >
          ➕ Создать категорию
        </Button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : records.length === 0 ? (
          <div className={styles.empty}>
            <h3>Нет категорий</h3>
            <p>Создайте первую категорию для записей</p>
            <Button onClick={handleCreateCategory}>
              Создать категорию
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {records.map(record => (
              <div key={record.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{record.title}</h3>
                  <span className={getStatusBadge(record.status)}>
                    {getStatusText(record.status)}
                  </span>
                </div>
                
                <div className={styles.cardContent}>
                  <p className={styles.slug}>/{record.slug}</p>
                  <p className={styles.description}>
                    {record.content || 'Нет описания'}
                  </p>
                </div>

                <div className={styles.cardMeta}>
                  <span className={styles.date}>
                    Создано: {new Date(record.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  {record.updatedAt !== record.createdAt && (
                    <span className={styles.date}>
                      Обновлено: {new Date(record.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Button
                    onClick={() => handleEditCategory(record)}
                    className={styles.editButton}
                  >
                    ✏️ Редактировать
                  </Button>
                  <Button
                    onClick={() => handleStatusChange(
                      record.id.toString(), 
                      record.status === 'published' ? 'draft' : 'published'
                    )}
                    className={styles.statusButton}
                  >
                    {record.status === 'published' ? '📝 В черновик' : '📤 Опубликовать'}
                  </Button>
                  <Button
                    onClick={() => handleDeleteCategory(record.id.toString())}
                    className={styles.deleteButton}
                  >
                    🗑️ Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
          >
            ←
          </Button>
          <span className={styles.paginationInfo}>
            Страница {currentPage} из {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
          >
            →
          </Button>
        </div>
      )}

      {/* Модальное окно создания/редактирования */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>
                {editingCategory ? 'Редактирование категории' : 'Создание категории'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Название категории</label>
                <Input
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Введите название категории"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Slug</label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Описание</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Описание категории"
                  className={styles.textarea}
                  rows={4}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Статус</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as 'draft' | 'published' 
                  }))}
                  className={styles.select}
                >
                  <option value="draft">Черновик</option>
                  <option value="published">Опубликована</option>
                </select>
              </div>
            </div>

            <div className={styles.modalActions}>
              <Button
                onClick={() => setShowCreateModal(false)}
                className={styles.cancelButton}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveCategory}
                className={styles.saveButton}
              >
                {editingCategory ? 'Сохранить изменения' : 'Создать категорию'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
