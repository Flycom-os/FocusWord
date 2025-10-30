/**
 * @page Records
 */

'use client'
import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, Eye, Edit, EyeOff, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/src/shared/ui/Table/ui-table";
import { getPostsPagination, deletePosts, publishPosts } from "@/src/shared/api/posts";
import { PostsPaginationResponse } from "@/src/shared/types/posts";
import styles from "./index.module.css";

const RecordsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<PostsPaginationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 6;

  // Загрузка записей
  useEffect(() => {
    loadRecords();
  }, [currentPage]);

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getPostsPagination(currentPage, itemsPerPage);
      setRecords(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка загрузки записей");
    } finally {
      setIsLoading(false);
    }
  };

  // Фильтрация записей по поисковому запросу
  const filteredRecords = useMemo(() => {
    if (!records || !searchQuery) return records?.rows || [];
    return records.rows.filter(record =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, records]);

  // Пагинация
  const totalPages = records?.total_pages || 1;
  const paginatedRecords = filteredRecords;

  const handleRecordSelect = (recordId: number) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === paginatedRecords.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(paginatedRecords.map(record => record.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (window.confirm("Вы уверены, что хотите удалить выбранные записи?")) {
      try {
        setIsLoading(true);
        setError(null);
        await deletePosts({ ids: selectedRecords });
        setSelectedRecords([]);
        await loadRecords();
      } catch (err: any) {
        setError(err.response?.data?.message || "Ошибка удаления записей");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePublishSelected = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await publishPosts({ ids: selectedRecords });
      setSelectedRecords([]);
      await loadRecords();
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка публикации записей");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublishSelected = async () => {
    // Для снятия с публикации нужно будет добавить отдельный API метод
    console.log("Снятие с публикации не реализовано");
  };

  const handleEditRecord = (recordId: number) => {
    router.push(`/admin/records/edit/${recordId}`);
  };

  const handleAddNew = () => {
    router.push("/admin/records/new");
  };

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "Опубликовано";
      case "DRAFT":
        return "Черновик";
      case "WAIT_FOR_PUBLISH":
        return "Ожидает публикации";
      default:
        return "Неизвестно";
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return styles.published;
      case "DRAFT":
        return styles.draft;
      case "WAIT_FOR_PUBLISH":
        return styles.waiting;
      default:
        return styles.draft;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Записи</h1>
          <p className={styles.subtitle}>Записи/Все записи</p>
        </div>
        <div className={styles.headerActions}>
          <Button theme="secondary" className={styles.addButton} onClick={handleAddNew}>
            <Plus size={16} />
            Добавить
          </Button>
        </div>
      </div>

      {/* Отображение ошибок */}
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {/* Поиск */}
      <div className={styles.searchSection}>
        <div className={styles.searchContainer}>
          <Input
            theme="secondary"
            icon="left"
            placeholder="Введите текст..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button theme="secondary" onClick={handleSearch} className={styles.searchButton}>
            Поиск
          </Button>
        </div>
      </div>

      {/* Панель действий с выбранными записями */}
      {selectedRecords.length > 0 && (
        <div className={styles.selectedActions}>
          <span className={styles.selectedCount}>
            Выбрано: {selectedRecords.length}
          </span>
          <div className={styles.actionButtons}>
            <Button theme="warning" onClick={handleDeleteSelected}>
              <Trash2 size={16} />
              Удалить
            </Button>
            <Button theme="third" onClick={handlePublishSelected}>
              <Eye size={16} />
              Опубликовать
            </Button>
            <Button theme="third" onClick={handleUnpublishSelected}>
              <EyeOff size={16} />
              Снять с публикации
            </Button>
            {selectedRecords.length === 1 && (
              <Button theme="third" onClick={() => handleEditRecord(selectedRecords[0])}>
                <Edit size={16} />
                Редактировать
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Таблица записей */}
      <div className={styles.content}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <input
                  type="checkbox"
                  checked={selectedRecords.length === paginatedRecords.length && paginatedRecords.length > 0}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Заголовок</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Дата</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  Загрузка...
                </TableCell>
              </TableRow>
            ) : paginatedRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                  Записи не найдены
                </TableCell>
              </TableRow>
            ) : (
              paginatedRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(record.id)}
                      onChange={() => handleRecordSelect(record.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className={styles.titleCell}>
                      <span className={styles.recordTitle}>{record.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.user.name}</TableCell>
                  <TableCell>{record.category.name}</TableCell>
                  <TableCell>
                    <div className={styles.dateCell}>
                      <Calendar size={14} />
                      {formatDate(record.updatedAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`${styles.statusBadge} ${getStatusClass(record.status || 'DRAFT')}`}>
                      {getStatusBadge(record.status || 'DRAFT')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={styles.rowActions}>
                      <Button theme="mini" onClick={() => handleEditRecord(record.id)}>
                        <Edit size={14} />
                      </Button>
                      <Button theme="mini" onClick={() => handleDeleteSelected()}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Пагинация */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            theme="third"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              theme={currentPage === page ? "secondary" : "third"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
          <Button
            theme="third"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            &gt;
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecordsPage;
