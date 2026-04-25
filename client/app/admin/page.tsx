'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/app/providers/auth-provider';
import { fetchWidgets } from '@/src/shared/api/widgets';
import { fetchFeedback } from '@/src/shared/api/feedback';
import { fetchProductCategories } from '@/src/shared/api/products';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { Button } from '@/src/shared/ui/Button/ui-button';
import styles from './admin.module.css';
import { fetchPages } from '@/src/shared/api/pages';
import { fetchSliders } from '@/src/shared/api/sliders';
import { fetchRecords } from '@/src/shared/api/records';

export default function AdminDashboard() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [stats, setStats] = useState({
    pages: 0,
    sliders: 0,
    records: 0,
    widgets: 0,
    feedback: 0,
    categories: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Загружаем статистику
      // @ts-ignore
      const [
        pagesResponse,
        slidersResponse,
        recordsResponse,
        widgetsResponse,
        feedbackResponse,
        categoriesResponse
      ] = await Promise.all([
        fetchPages(accessToken, { page: 1, limit: 1 }),
        fetchSliders(accessToken, { page: 1, limit: 1 }),
        fetchRecords(accessToken, { page: 1, limit: 1 }),
        fetchWidgets(accessToken, { page: 1, limit: 1 }),
        fetchFeedback(accessToken, { page: 1, limit: 5 }),
        fetchProductCategories(accessToken, 1, 1, '')
      ]);

      // @ts-ignore
      setStats({
        //@ts-nocheck
        pages: pagesResponse.total || 0,
        sliders: slidersResponse.total || 0,
        records: recordsResponse.total || 0,
        widgets: widgetsResponse.total || 0,
        feedback: feedbackResponse.total || 0,
        categories: categoriesResponse.total || 0
      });

      // Формируем недавнюю активность
      const activity = [
        ...feedbackResponse.data.map((item: any) => ({
          type: 'feedback',
          title: `Новый отзыв от ${item.name}`,
          description: item.message.substring(0, 100) + '...',
          time: item.createdAt,
          status: item.status
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

      setRecentActivity(activity);
    } catch (error) {
      showToast('Ошибка при загрузке данных дашборда', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Создать страницу',
      description: 'Добавить новую страницу на сайт',
      icon: '📄',
      action: () => router.push('/admin/pages/create')
    },
    {
      title: 'Создать запись',
      description: 'Добавить новую запись в блог',
      icon: '📝',
      action: () => router.push('/admin/records/create')
    },
    {
      title: 'Создать виджет',
      description: 'Добавить новый виджет на сайт',
      icon: '🎯',
      action: () => router.push('/admin/widgets')
    },
    {
      title: 'Создать слайдер',
      description: 'Добавить новый слайдер',
      icon: '🎠',
      action: () => router.push('/admin/sliders')
    }
  ];

  const navigationItems = [
    {
      title: 'Контент',
      items: [
        { title: 'Страницы', count: stats.pages, icon: '📄', url: '/admin/pages' },
        { title: 'Записи', count: stats.records, icon: '📝', url: '/admin/records' },
        { title: 'Виджеты', count: stats.widgets, icon: '🎯', url: '/admin/widgets' },
        { title: 'Слайдеры', count: stats.sliders, icon: '🎠', url: '/admin/sliders' }
      ]
    },
    {
      title: 'Управление',
      items: [
        { title: 'Пользователи', count: null, icon: '👥', url: '/admin/users' },
        { title: 'Роли', count: null, icon: '🔐', url: '/admin/roles' },
        { title: 'Категории', count: stats.categories, icon: '📁', url: '/admin/product-categories' },
        { title: 'Отзывы', count: stats.feedback, icon: '💬', url: '/admin/feedback' }
      ]
    },
    {
      title: 'Настройки',
      items: [
        { title: 'Общие настройки', count: null, icon: '⚙️', url: '/admin/settings' },
        { title: 'SEO', count: null, icon: '🔍', url: '/admin/seo' },
        { title: 'Медиафайлы', count: null, icon: '🖼️', url: '/admin/media-files' }
      ]
    }
  ];

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка дашборда...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Панель управления</h1>
          <p>Добро пожаловать в FocusWord Admin Panel</p>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.pages + stats.records}</div>
            <div className={styles.statLabel}>Контент</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.widgets}</div>
            <div className={styles.statLabel}>Виджеты</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statNumber}>{stats.feedback}</div>
            <div className={styles.statLabel}>Отзывы</div>
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h2>Быстрые действия</h2>
        <div className={styles.actionGrid}>
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={styles.actionCard}
            >
              <div className={styles.actionIcon}>{action.icon}</div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.navigation}>
          <h2>Навигация</h2>
          <div className={styles.navGrid}>
            {navigationItems.map((section, index) => (
              <div key={index} className={styles.navSection}>
                <h3>{section.title}</h3>
                <div className={styles.navItems}>
                  {section.items.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      onClick={() => router.push(item.url)}
                      className={styles.navItem}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navTitle}>{item.title}</span>
                      {item.count !== null && (
                        <span className={styles.navCount}>{item.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2>Последняя активность</h2>
          <div className={styles.activityList}>
            {recentActivity.length === 0 ? (
              <div className={styles.noActivity}>
                <p>Нет недавней активности</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === 'feedback' ? '💬' : '📝'}
                  </div>
                  <div className={styles.activityContent}>
                    <h4>{activity.title}</h4>
                    <p>{activity.description}</p>
                    <div className={styles.activityMeta}>
                      <span className={styles.activityTime}>
                        {new Date(activity.time).toLocaleString()}
                      </span>
                      {activity.status && (
                        <span className={`${styles.activityStatus} ${styles[activity.status]}`}>
                          {activity.status === 'pending' ? 'В ожидании' : 
                           activity.status === 'approved' ? 'Одобрен' : 'Отклонен'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <p>FocusWord Admin Panel v1.0</p>
          <div className={styles.footerLinks}>
            <button onClick={() => router.push('/admin/settings')}>
              ⚙️ Настройки
            </button>
            <button onClick={() => window.open('/', '_blank')}>
              🌐 Сайт
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
