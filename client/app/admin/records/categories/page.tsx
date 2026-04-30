'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { recordsApi, RecordDto, CategoryDto, CreateCategoryDto, UpdateCategoryDto } from '@/src/shared/api/records';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import styles from './categories.module.css';

export default function RecordCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: '',
    slug: '',
    description: ''
  });

  useEffect(() => {
    loadCategories();
  }, [currentPage, search]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await recordsApi.getCategories(currentPage, 10, search);
      setCategories(response.data);
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
      description: ''
    });
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: CategoryDto) => {
    setCategoryForm({
      title: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData: CreateCategoryDto = {
        name: categoryForm.title,
        slug: categoryForm.slug,
        description: categoryForm.description
      };
      
      if (editingCategory) {
        await recordsApi.updateCategory(editingCategory.id.toString(), {
          ...categoryData,
          id: editingCategory.id
        });
        showToast('Категория обновлена', 'success');
      } else {
        await recordsApi.createCategory(categoryData);
        showToast('Категория создана', 'success');
      }
      
      setShowCreateModal(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      showToast('Ошибка при сохранении категории', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }
    
    try {
      await recordsApi.deleteCategory(id);
      showToast('Категория удалена', 'success');
      loadCategories();
    } catch (error) {
      showToast('Ошибка при удалении категории', 'error');
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
        ) : categories.length === 0 ? (
          <div className={styles.empty}>
            <h3>Нет категорий</h3>
            <p>Создайте первую категорию для записей</p>
            <Button onClick={handleCreateCategory}>
              Создать категорию
            </Button>
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map(category => (
              <div key={category.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{category.name}</h3>
                </div>
                
                <div className={styles.cardContent}>
                  <p className={styles.slug}>/{category.slug}</p>
                  <p className={styles.description}>
                    {category.description || 'Нет описания'}
                  </p>
                </div>

                <div className={styles.cardMeta}>
                  <span className={styles.date}>
                    Создано: {new Date(category.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  {category.updatedAt !== category.createdAt && (
                    <span className={styles.date}>
                      Обновлено: {new Date(category.updatedAt).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <Button
                    onClick={() => handleEditCategory(category)}
                    className={styles.editButton}
                  >
                    ✏️ Редактировать
                  </Button>
                  <Button
                    onClick={() => handleDeleteCategory(category.id.toString())}
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
