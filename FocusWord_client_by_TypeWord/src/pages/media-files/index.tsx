/**
 * @page MediaFiles
 */
'use client'
import React, { useState, useMemo } from "react";
import { Search, List, Grid3X3, Plus, Trash2, Edit, Eye, Download } from "lucide-react";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/src/shared/ui/Table/ui-table";
import EditMediaFileModal, { MediaFile } from "./EditMediaFileModal";
import styles from "./index.module.css";

// Заготовленные данные медиафайлов
const mockMediaFiles: MediaFile[] = [
  {
    id: 1,
    name: "Изображение 1",
    type: "image",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "01.01.2024",
    size: "2.5 MB",
    alt: "Изображение 1",
    compression: "none"
  },
  {
    id: 2,
    name: "Документ 1",
    type: "document",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "02.01.2024",
    size: "1.2 MB",
    alt: "Документ 1",
    compression: "none"
  },
  {
    id: 3,
    name: "Видео 1",
    type: "video",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "03.01.2024",
    size: "15.8 MB",
    alt: "Видео 1",
    compression: "medium"
  },
  {
    id: 4,
    name: "Изображение 2",
    type: "image",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "04.01.2024",
    size: "3.1 MB",
    alt: "Изображение 2",
    compression: "high"
  },
  {
    id: 5,
    name: "Аудио 1",
    type: "audio",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "05.01.2024",
    size: "4.7 MB",
    alt: "Аудио 1",
    compression: "low"
  },
  {
    id: 6,
    name: "Документ 2",
    type: "document",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "06.01.2024",
    size: "0.8 MB",
    alt: "Документ 2",
    compression: "none"
  },
  {
    id: 7,
    name: "Изображение 3",
    type: "image",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "07.01.2024",
    size: "2.9 MB",
    alt: "Изображение 3",
    compression: "medium"
  },
  {
    id: 8,
    name: "Видео 2",
    type: "video",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "08.01.2024",
    size: "22.3 MB",
    alt: "Видео 2",
    compression: "high"
  },
  {
    id: 9,
    name: "Документ 3",
    type: "document",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "09.01.2024",
    size: "1.5 MB",
    alt: "Документ 3",
    compression: "none"
  },
  {
    id: 10,
    name: "Изображение 4",
    type: "image",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "10.01.2024",
    size: "1.8 MB",
    alt: "Изображение 4",
    compression: "low"
  },
  {
    id: 11,
    name: "Аудио 2",
    type: "audio",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "11.01.2024",
    size: "6.2 MB",
    alt: "Аудио 2",
    compression: "medium"
  },
  {
    id: 12,
    name: "Видео 3",
    type: "video",
    url: "/api/placeholder/150/150",
    thumbnail: "/api/placeholder/150/150",
    author: "Админ",
    date: "12.01.2024",
    size: "18.7 MB",
    alt: "Видео 3",
    compression: "high"
  }
];

type ViewMode = "list" | "grid";

const MediaFilesPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(mockMediaFiles);
  const itemsPerPage = 6;

  // Фильтрация файлов по поисковому запросу
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return mediaFiles;
    return mediaFiles.filter(file =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, mediaFiles]);

  // Пагинация
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const handleFileSelect = (fileId: number) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleSelectAll = () => {
    if (selectedFiles.length === paginatedFiles.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(paginatedFiles.map(file => file.id));
    }
  };

  const handleDeleteSelected = () => {
    // Здесь будет логика удаления выбранных файлов
    console.log("Удаление файлов:", selectedFiles);
    setSelectedFiles([]);
  };

  const handleSearch = () => {
    setCurrentPage(1); // Сброс на первую страницу при поиске
  };

  const handleEditFile = (file: MediaFile) => {
    setEditingFile(file);
    setIsEditModalOpen(true);
  };

  const handleSaveFile = (updatedFile: MediaFile) => {
    setMediaFiles(prev => 
      prev.map(file => file.id === updatedFile.id ? updatedFile : file)
    );
  };

  const handleDeleteFile = (fileId: number) => {
    setMediaFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const handleDownloadFile = (file: MediaFile) => {
    // Здесь будет логика скачивания файла
    console.log("Скачивание файла:", file);
    // В реальном приложении здесь будет создание ссылки для скачивания
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Медиафайлы</h1>
          <p className={styles.subtitle}>Медиафайлы/</p>
        </div>
        <div className={styles.headerActions}>
          <Button theme="secondary" className={styles.addButton}>
            <Plus size={16} />
            Добавить
          </Button>
        </div>
      </div>

      {/* Поиск и переключатель вида */}
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
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === "list" ? styles.active : ""}`}
            onClick={() => setViewMode("list")}
          >
            <List size={16} />
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === "grid" ? styles.active : ""}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      {/* Панель действий с выбранными файлами */}
      {selectedFiles.length > 0 && (
        <div className={styles.selectedActions}>
          <span className={styles.selectedCount}>
            Выбрано: {selectedFiles.length}
          </span>
          <div className={styles.actionButtons}>
            <Button theme="warning" onClick={handleDeleteSelected}>
              <Trash2 size={16} />
              Удалить
            </Button>
            <Button theme="third">
              <Eye size={16} />
              Открыть оригинал
            </Button>
            <Button theme="third">
              <Download size={16} />
              Открыть миниатюру
            </Button>
            <Button theme="third">
              <Edit size={16} />
              Редактировать
            </Button>
          </div>
        </div>
      )}

      {/* Контент - список или сетка */}
      <div className={styles.content}>
        {viewMode === "list" ? (
          <div className={styles.listView}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={selectedFiles.length === paginatedFiles.length && paginatedFiles.length > 0}
                      onChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Файл</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Дата</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleFileSelect(file.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className={styles.fileInfo}>
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className={styles.thumbnail}
                        />
                        <span>{file.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{file.author}</TableCell>
                    <TableCell>{file.date}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>
                      <div className={styles.rowActions}>
                        <Button theme="mini" onClick={() => handleDownloadFile(file)}>
                          <Eye size={14} />
                        </Button>
                        <Button theme="mini" onClick={() => handleEditFile(file)}>
                          <Edit size={14} />
                        </Button>
                        <Button theme="mini" onClick={() => handleDeleteFile(file.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className={styles.gridView}>
            {paginatedFiles.map((file) => (
              <div key={file.id} className={styles.gridItem}>
                <div className={styles.gridItemContent}>
                  <input
                    type="checkbox"
                    className={styles.gridCheckbox}
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => handleFileSelect(file.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className={styles.gridThumbnail}
                    onClick={() => handleEditFile(file)}
                  />
                  <span className={styles.gridFileName} onClick={() => handleEditFile(file)}>{file.name}</span>
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

      {/* Модальное окно редактирования */}
      <EditMediaFileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        file={editingFile}
        onSave={handleSaveFile}
        onDelete={handleDeleteFile}
        onDownload={handleDownloadFile}
      />
    </div>
  );
};

export default MediaFilesPage;
