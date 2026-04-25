'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchPosts, createPost, updatePost, deletePost, publishPost, unpublishPost } from '@/src/shared/api/posts';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Modal, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './posts.module.css';

export default function PostsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: ''
  });

  useEffect(() => {
    loadPosts();
  }, [pagination.page, search, statusFilter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await fetchPosts(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setPosts(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast('Ошибка при загрузке постов', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      seoTitle: '',
      seoDescription: '',
      metaKeywords: ''
    });
    setShowModal(true);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      status: post.status,
      seoTitle: post.seoTitle || '',
      seoDescription: post.seoDescription || '',
      metaKeywords: post.metaKeywords?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const postData = {
        ...form,
        metaKeywords: form.metaKeywords ? form.metaKeywords.split(',').map(k => k.trim()).filter(k => k) : []
      };

      if (editingPost) {
        await updatePost(accessToken, editingPost.id, postData);
        showToast('Пост обновлен', 'success');
      } else {
        await createPost(accessToken, postData);
        showToast('Пост создан', 'success');
      }
      setShowModal(false);
      loadPosts();
    } catch (error) {
      showToast('Ошибка при сохранении поста', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены что хотите удалить этот пост?')) {
      try {
        await deletePost(accessToken, id);
        showToast('Пост удален', 'success');
        loadPosts();
      } catch (error) {
        showToast('Ошибка при удалении поста', 'error');
      }
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishPost(accessToken, id);
      showToast('Пост опубликован', 'success');
      loadPosts();
    } catch (error) {
      showToast('Ошибка при публикации поста', 'error');
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishPost(accessToken, id);
      showToast('Пост снят с публикации', 'success');
      loadPosts();
    } catch (error) {
      showToast('Ошибка при снятии с публикации', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return styles.published;
      case 'draft': return styles.draft;
      default: return styles.draft;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'Опубликовано';
      case 'draft': return 'Черновик';
      default: return status;
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Посты блога</h1>
        <p>Управление постами и статьями</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Поиск постов..."
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
            <option value="draft">Черновики</option>
            <option value="published">Опубликовано</option>
          </select>
        </div>
        <Button onClick={handleCreate} className={styles.createButton}>
          ➕ Создать пост
        </Button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Заголовок</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Дата создания</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className={styles.titleCell}>
                    <div>
                      <div className={styles.postTitle}>{post.title}</div>
                      {post.excerpt && (
                        <div className={styles.postExcerpt}>
                          {post.excerpt.length > 100 
                            ? `${post.excerpt.substring(0, 100)}...` 
                            : post.excerpt
                          }
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{post.slug}</TableCell>
                  <TableCell>
                    <span className={`${styles.status} ${getStatusColor(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button
                        onClick={() => handleEdit(post)}
                        className={styles.editButton}
                      >
                        ✏️
                      </Button>
                      {post.status === 'draft' ? (
                        <Button
                          onClick={() => handlePublish(post.id)}
                          className={styles.publishButton}
                        >
                          📤
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUnpublish(post.id)}
                          className={styles.unpublishButton}
                        >
                          📥
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(post.id)}
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
        title={editingPost ? 'Редактировать пост' : 'Создать пост'}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Заголовок</label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите заголовок поста"
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
            <label>Краткое описание</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Краткое описание поста"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Содержимое</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Полное содержимое поста"
              className={styles.textarea}
              rows={10}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
              className={styles.select}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликовано</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>SEO заголовок</label>
            <Input
              value={form.seoTitle}
              onChange={(e) => setForm(prev => ({ ...prev, seoTitle: e.target.value }))}
              placeholder="SEO заголовок"
            />
          </div>

          <div className={styles.formGroup}>
            <label>SEO описание</label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => setForm(prev => ({ ...prev, seoDescription: e.target.value }))}
              placeholder="SEO описание"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Ключевые слова</label>
            <Input
              value={form.metaKeywords}
              onChange={(e) => setForm(prev => ({ ...prev, metaKeywords: e.target.value }))}
              placeholder="ключевые, слова, через, запятую"
            />
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingPost ? 'Сохранить' : 'Создать'}
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
