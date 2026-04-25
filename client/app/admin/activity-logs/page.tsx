'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchActivityLogs, fetchActivityStats } from '@/src/shared/api/activity-logs';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './activity-logs.module.css';

export default function ActivityLogsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'logs' | 'stats'>('logs');

  useEffect(() => {
    loadData();
  }, [pagination.page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [logsData, statsData] = await Promise.all([
        fetchActivityLogs(accessToken, {
          page: pagination.page,
          limit: pagination.limit,
          search
        }),
        fetchActivityStats(accessToken)
      ]);
      setLogs(logsData.data);
      setStats(statsData);
      setPagination(prev => ({ ...prev, total: logsData.total }));
    } catch (error) {
      showToast('Ошибка при загрузке логов активности', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'login': return '🔐';
      case 'logout': return '🚪';
      default: return '📝';
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Логи активности</h1>
        <p>История действий пользователей</p>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('logs')}
          className={`${styles.tab} ${activeTab === 'logs' ? styles.active : ''}`}
        >
          Логи
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
        >
          Статистика
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <>
          {activeTab === 'logs' && (
            <div className={styles.content}>
              <div className={styles.toolbar}>
                <input
                  type="text"
                  placeholder="Поиск действий..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.search}
                />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Действие</TableHead>
                    <TableHead>Сущность</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Пользователь</TableHead>
                    <TableHead>IP адрес</TableHead>
                    <TableHead>Дата</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className={styles.action}>
                          <span className={styles.actionIcon}>{getActionIcon(log.action)}</span>
                          {log.action}
                        </div>
                      </TableCell>
                      <TableCell>{log.entityType || '-'}</TableCell>
                      <TableCell>{log.entityId || '-'}</TableCell>
                      <TableCell>{log.userId || '-'}</TableCell>
                      <TableCell>{log.ipAddress || '-'}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className={styles.stats}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{stats.totalActions}</div>
                  <div className={styles.statLabel}>Всего действий</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{Object.keys(stats.actionsByType || {}).length}</div>
                  <div className={styles.statLabel}>Типов действий</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>{stats.actionsByUser?.length || 0}</div>
                  <div className={styles.statLabel}>Активных пользователей</div>
                </div>
              </div>

              <div className={styles.recentActions}>
                <h3>Последние действия</h3>
                <div className={styles.actionList}>
                  {stats.recentActions?.slice(0, 10).map((action: any, index: number) => (
                    <div key={index} className={styles.actionItem}>
                      <span className={styles.actionIcon}>{getActionIcon(action.action)}</span>
                      <div className={styles.actionContent}>
                        <div className={styles.actionName}>{action.action}</div>
                        <div className={styles.actionTime}>
                          {new Date(action.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'logs' && pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.limit}
            onChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}
    </div>
  );
}
