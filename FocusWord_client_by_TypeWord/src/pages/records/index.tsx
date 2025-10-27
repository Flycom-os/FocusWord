/**
 * @page Records
 */

'use client'
import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, Eye, Edit, EyeOff, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/src/shared/ui/Table/ui-table";
import styles from "./index.module.css";

// Заготовленные данные записей
const mockRecords = [
  {
    id: 1,
    title: "Заголовок",
    author: "Админ",
    category: "Без категории",
    date: "01.01.2024",
    status: "published",
    content: "Содержимое записи..."
  },
  {
    id: 2,
    title: "Привет, мир!",
    author: "Админ",
    category: "Без категории",
    date: "01.01.2024",
    status: "published",
    content: "Это первая запись в блоге..."
  },
  {
    id: 3,
    title: "Слон - это вкусно!",
    author: "Админ",
    category: "Блюда",
    date: "02.01.2024",
    status: "draft",
    content: "Рецепт приготовления слона..."
  },
  {
    id: 4,
    title: "Шины - не бананы!",
    author: "Админ",
    category: "Автомобили",
    date: "03.01.2024",
    status: "published",
    content: "Почему шины нельзя есть..."
  },
  {
    id: 5,
    title: "Рефераты",
    author: "Админ",
    category: "Обучение",
    date: "04.01.2024",
    status: "draft",
    content: "Как правильно писать рефераты..."
  },
  {
    id: 6,
    title: "Новая запись",
    author: "Админ",
    category: "Без категории",
    date: "05.01.2024",
    status: "published",
    content: "Содержимое новой записи..."
  },
  {
    id: 7,
    title: "Еще одна запись",
    author: "Админ",
    category: "Блюда",
    date: "06.01.2024",
    status: "draft",
    content: "Описание еще одной записи..."
  },
  {
    id: 8,
    title: "Последняя запись",
    author: "Админ",
    category: "Автомобили",
    date: "07.01.2024",
    status: "published",
    content: "Финальная запись в списке..."
  }
];

const RecordsPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState(mockRecords);
  const itemsPerPage = 6;

  // Фильтрация записей по поисковому запросу
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    return records.filter(record =>
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, records]);

  // Пагинация
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + itemsPerPage);

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

  const handleDeleteSelected = () => {
    if (window.confirm("Вы уверены, что хотите удалить выбранные записи?")) {
      setRecords(prev => prev.filter(record => !selectedRecords.includes(record.id)));
      setSelectedRecords([]);
    }
  };

  const handlePublishSelected = () => {
    setRecords(prev => 
      prev.map(record => 
        selectedRecords.includes(record.id) 
          ? { ...record, status: "published" }
          : record
      )
    );
    setSelectedRecords([]);
  };

  const handleUnpublishSelected = () => {
    setRecords(prev => 
      prev.map(record => 
        selectedRecords.includes(record.id) 
          ? { ...record, status: "draft" }
          : record
      )
    );
    setSelectedRecords([]);
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
    return status === "published" ? "Опубликовано" : "Черновик";
  };

  const getStatusClass = (status: string) => {
    return status === "published" ? styles.published : styles.draft;
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
            {paginatedRecords.map((record) => (
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
                <TableCell>{record.author}</TableCell>
                <TableCell>{record.category}</TableCell>
                <TableCell>
                  <div className={styles.dateCell}>
                    <Calendar size={14} />
                    {record.date}
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                    {getStatusBadge(record.status)}
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
            ))}
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
