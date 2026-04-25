'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { Pagination, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import { Modal } from '@/src/shared/ui';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import styles from './wiki.module.css';

interface WikiArticle {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published';
  views: number;
}

export default function WikiPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WikiArticle | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    category: '',
    status: 'draft' as 'draft' | 'published'
  });

  // Моковые данные для демонстрации
  const mockArticles: WikiArticle[] = [
    {
      id: 1,
      title: 'Getting Started',
      slug: 'getting-started',
      content: '# Getting Started\n\nWelcome to FocusWord! This guide will help you get started with the platform.\n\n## Installation\n\n1. Clone the repository\n2. Install dependencies\n3. Configure environment variables\n4. Run the application\n\n## Basic Concepts\n\nFocusWord is built with modern technologies:\n- Next.js for frontend\n- NestJS for backend\n- PostgreSQL for database\n- Prisma for ORM\n- TypeScript for type safety\n\n## Features\n\n- 📝 Content Management\n- 🎨 Modern UI/UX\n- 🔍 SEO Optimization\n- 📊 Analytics\n- 🎯 Widget System\n- 💳 Payment Integration',
      category: 'Documentation',
      author: 'Admin',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      status: 'published',
      views: 245
    },
    {
      id: 2,
      title: 'User Guide',
      slug: 'user-guide',
      content: '# User Guide\n\nComplete guide for using FocusWord admin panel.\n\n## Dashboard\n\nThe dashboard provides an overview of your system:\n- 📊 Statistics and analytics\n- 🔄 Recent activity\n- ⚡ Quick actions\n- 📈 System status\n\n## Content Management\n\n### Pages\n- Create, edit, and manage pages\n- Rich text editor with advanced features\n- SEO optimization tools\n- Page templates and blocks\n\n### Records\n- Blog-like content management\n- Categories and tags\n- Media integration\n\n### Widgets\n- Dynamic widget system\n- Multiple widget types\n- Drag and drop interface\n- Custom styling options\n\n## Settings\n\nConfigure your application:\n- 🌐 General settings\n- 🎨 Appearance customization\n- 📧 Email configuration\n- 🔐 Security options\n- 📊 Analytics setup',
      category: 'Documentation',
      author: 'Admin',
      createdAt: '2024-01-14T14:30:00Z',
      updatedAt: '2024-01-14T14:30:00Z',
      status: 'published',
      views: 189
    },
    {
      id: 3,
      title: 'API Documentation',
      slug: 'api-documentation',
      content: '# API Documentation\n\nComplete API reference for FocusWord.\n\n## Authentication\n\n```typescript\n// Login\nPOST /api/auth/login\n{\n  "email": "user@example.com",\n  "password": "password"\n}\n\n// Response\n{\n  "token": "jwt-token",\n  "user": {\n    "id": 1,\n    "email": "user@example.com",\n    "role": "admin"\n  }\n}\n```\n\n## Pages API\n\n```typescript\n// Get all pages\nGET /api/pages\n\n// Create page\nPOST /api/pages\n{\n  "title": "Page Title",\n  "slug": "page-slug",\n  "content": "Page content",\n  "status": "published"\n}\n```\n\n## Widgets API\n\n```typescript\n// Get all widgets\nGET /api/widgets\n\n// Create widget\nPOST /api/widgets\n{\n  "name": "Widget Name",\n  "type": "text",\n  "content": "Widget content",\n  "status": "active"\n}\n```\n\n## Error Handling\n\nAll API endpoints return consistent error responses:\n- 400 for validation errors\n- 401 for authentication errors\n- 404 for not found\n- 500 for server errors',
      category: 'Documentation',
      author: 'Admin',
      createdAt: '2024-01-13T12:00:00Z',
      updatedAt: '2024-01-13T12:00:00Z',
      status: 'published',
      views: 156
    },
    {
      id: 4,
      title: 'Troubleshooting',
      slug: 'troubleshooting',
      content: '# Troubleshooting\n\nCommon issues and solutions.\n\n## Installation Issues\n\n### Database Connection\n\n**Problem**: Cannot connect to database\n\n**Solution**: \n1. Check database URL in .env\n2. Verify database is running\n3. Check credentials\n4. Run migrations: `npx prisma migrate`\n\n### Build Errors\n\n**Problem**: TypeScript compilation errors\n\n**Solution**: \n1. Check types in tsconfig.json\n2. Install missing dependencies: `npm install`\n3. Clear cache: `npm run clean`\n\n## Performance Issues\n\n### Slow Loading\n\n**Problem**: Pages load slowly\n\n**Solution**: \n1. Optimize database queries\n2. Add caching\n3. Use lazy loading\n4. Enable compression\n\n### Memory Issues\n\n**Problem**: High memory usage\n\n**Solution**: \n1. Check for memory leaks\n2. Optimize images\n3. Use pagination\n4. Enable garbage collection\n\n## Common Fixes\n\n### Clear Cache\n```bash\nnpm run clean\nnpm run build\n```\n\n### Reset Database\n```bash\nnpx prisma migrate reset\nnpx prisma migrate\n```',
      category: 'Support',
      author: 'Admin',
      createdAt: '2024-01-12T10:00:00Z',
      updatedAt: '2024-01-12T10:00:00Z',
      status: 'published',
      views: 98
    },
    {
      id: 5,
      title: 'Development Setup',
      slug: 'development-setup',
      content: '# Development Setup\n\nLocal development environment setup.\n\n## Prerequisites\n\n- Node.js 18+\n- npm or yarn\n- PostgreSQL 12+\n\n## Environment Variables\n\n```bash\nDATABASE_URL="postgresql://username:password@localhost:5432/focusword"\nNEXT_PUBLIC_API_URL="http://localhost:1331"\nJWT_SECRET="your-jwt-secret"\n```\n\n## Installation\n\n```bash\n# Clone repository\ngit clone https://github.com/your-org/focusword.git\n\n# Install dependencies\nnpm install\n\n# Setup database\nnpx prisma migrate\n\n# Start development server\nnpm run dev\n```\n\n## Project Structure\n\n```\nclient/                 # Next.js frontend\n├── src/\n│   ├── app/          # App router pages\n│   ├── components/    # Reusable components\n│   ├── shared/       # Shared utilities and types\n│   └── widgets/      # UI widgets\n├── public/             # Static assets\n└── styles/            # Global styles\n\nbackend/                # NestJS backend\n├── src/\n│   ├── modules/      # Feature modules\n│   ├── common/       # Shared utilities\n│   └── config/       # Configuration\n├── prisma/            # Database schema\n└── test/              # Test files\n```\n\n## Scripts\n\n```json\n{\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start",\n    "test": "jest",\n    "lint": "eslint . --ext .ts,.tsx",\n    "type-check": "tsc --noEmit"\n  }\n}\n```',
      category: 'Development',
      author: 'Admin',
      createdAt: '2024-01-11T09:00:00Z',
      updatedAt: '2024-01-11T09:00:00Z',
      status: 'published',
      views: 76
    }
  ];

  useEffect(() => {
    loadArticles();
  }, [pagination.page, search, categoryFilter, statusFilter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      // Фильтрация моковых данных
      let filteredArticles = mockArticles;
      
      if (search) {
        filteredArticles = filteredArticles.filter(article => 
          article.title.toLowerCase().includes(search.toLowerCase()) ||
          article.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (categoryFilter !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.category === categoryFilter);
      }
      
      if (statusFilter !== 'all') {
        filteredArticles = filteredArticles.filter(article => article.status === statusFilter);
      }
      
      setArticles(filteredArticles);
      setPagination(prev => ({ ...prev, total: filteredArticles.length }));
    } catch (error) {
      showToast('Ошибка при загрузке статей', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingArticle(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      category: 'Documentation',
      status: 'draft'
    });
    setShowCreateModal(true);
  };

  const handleEdit = (article: WikiArticle) => {
    setEditingArticle(article);
    setForm({
      title: article.title,
      slug: article.slug,
      content: article.content,
      category: article.category,
      status: article.status
    });
    setShowCreateModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingArticle) {
        // Обновление существующей статьи
        console.log('Updating article:', editingArticle.id);
        showToast('Статья обновлена', 'success');
      } else {
        // Создание новой статьи
        const newArticle = {
          ...form,
          id: Date.now(),
          author: 'Admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: 0
        };
        setArticles(prev => [newArticle, ...prev]);
        showToast('Статья создана', 'success');
      }
      setShowCreateModal(false);
      setEditingArticle(null);
    } catch (error) {
      showToast('Ошибка при сохранении статьи', 'error');
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены что хотите удалить эту статью?')) {
      setArticles(prev => prev.filter(article => article.id !== id));
      showToast('Статья удалена', 'success');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return styles.published;
      case 'draft': return styles.draft;
      default: return styles.draft;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Documentation': return '📚';
      case 'Support': return '🛠️';
      case 'Development': return '👨‍💻';
      default: return '📄';
    }
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? `${content.substring(0, maxLength)}...` : content;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>📚 База знаний</h1>
        <p>Документация и руководство по FocusWord</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="🔍 Поиск статей..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">Все категории</option>
            <option value="Documentation">📚 Документация</option>
            <option value="Support">🛠️ Поддержка</option>
            <option value="Development">👨‍💻 Разработка</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={styles.select}
          >
            <option value="all">Все статусы</option>
            <option value="published">✅ Опубликовано</option>
            <option value="draft">📝 Черновик</option>
          </select>
        </div>
        <Button onClick={handleCreate} className={styles.createButton}>
          ➕ Создать статью
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
                <TableHead>Категория</TableHead>
                <TableHead>Автор</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Просмотры</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <div className={styles.articleTitle}>
                      <span className={styles.categoryIcon}>{getCategoryIcon(article.category)}</span>
                      {article.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={styles.category}>{article.category}</span>
                  </TableCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell>
                    <span className={`${styles.status} ${getStatusColor(article.status)}`}>
                      {article.status === 'published' ? '✅ Опубликовано' : '📝 Черновик'}
                    </span>
                  </TableCell>
                  <TableCell>{article.views}</TableCell>
                  <TableCell>{new Date(article.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button
                        onClick={() => handleEdit(article)}
                        className={styles.editButton}
                      >
                        ✏️
                      </Button>
                      <Button
                        onClick={() => handleDelete(article.id)}
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
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingArticle ? 'Редактировать статью' : 'Создать статью'}
        className={styles.modal}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Заголовок</label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Введите заголовок статьи"
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
            <label>Категория</label>
            <select
              value={form.category}
              onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
              className={styles.select}
            >
              <option value="Documentation">📚 Документация</option>
              <option value="Support">🛠️ Поддержка</option>
              <option value="Development">👨‍💻 Разработка</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Статус</label>
            <select
              value={form.status}
              onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value as any }))}
              className={styles.select}
            >
              <option value="draft">📝 Черновик</option>
              <option value="published">✅ Опубликовано</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Содержимое</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Введите содержимое статьи (поддерживается Markdown)"
              className={styles.textarea}
              rows={10}
            />
          </div>

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingArticle ? 'Сохранить' : 'Создать'}
            </Button>
            <Button
              onClick={() => setShowCreateModal(false)}
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
