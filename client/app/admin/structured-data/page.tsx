'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchStructuredData, createStructuredData, updateStructuredData, deleteStructuredData } from '@/src/shared/api/structured-data';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './structured-data.module.css';

export default function StructuredDataPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, [pagination.page, search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchStructuredData(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setData(response.data);
      setPagination(prev => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast('Ошибка при загрузке структурированных данных', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены что хотите удалить эти данные?')) {
      try {
        await deleteStructuredData(accessToken, id);
        showToast('Данные удалены', 'success');
        loadData();
      } catch (error) {
        showToast('Ошибка при удалении данных', 'error');
      }
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Структурированные данные</h1>
        <p>JSON-LD разметка для SEO</p>
      </div>

      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Поиск данных..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Загрузка...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Тип</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Дата создания</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className={styles.type}>
                    <span className={styles.typeIcon}>📋</span>
                    {item.type}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${styles.status} ${item.isActive ? styles.active : styles.inactive}`}>
                    {item.isActive ? 'Активен' : 'Неактивен'}
                  </span>
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={styles.deleteButton}
                    >
                      🗑️
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
    </div>
  );
}
