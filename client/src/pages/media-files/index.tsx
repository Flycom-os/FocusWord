'use client';

/**
 * @page MediaFiles
 */

import { useEffect, useMemo, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/media-files/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import { deleteMediaFile, fetchMediaFiles, MediaFileDto, MediaFilesQuery, uploadMediaFile, updateMediaFile } from "@/src/shared/api/mediafiles";
import { Pagination, PermissionGate, UiButton, Modal, Notifications, showToast, VideoPlayer, AudioPlayer, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Select } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery: MediaFilesQuery = {
  page: 1,
  limit: 20,
  sortBy: "uploadedAt",
  sortOrder: "desc",
};

const MediaFilesPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<MediaFilesQuery>(defaultQuery);
  const [data, setData] = useState<MediaFileDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<MediaFileDto | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("");

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(total / query.limit));
  }, [total, query.limit]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchMediaFiles(accessToken, query);
        setData(res.data);
        setTotal(res.total);
        setSelectedIds([]);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось загрузить медиафайлы";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map((item) => item.id));
    }
  };

  const handleEdit = (file: MediaFileDto) => {
    setEditingFile(file);
    setFilename(file.filename);
    setAltText(file.altText || "");
    setCaption(file.caption || "");
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingFile(null);
    setFilename("");
    setAltText("");
    setCaption("");
    setFileToUpload(null);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (editingFile) {
      // Редактирование
      try {
        await updateMediaFile(accessToken, editingFile.id, {
          altText: altText,
          caption: caption || undefined,
        });
        showToast("Файл обновлен", "success");
        setIsModalOpen(false);
        setEditingFile(null);
        setQuery((prev) => ({ ...prev }));
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось обновить файл";
        showToast(message, "error");
      }
    } else {
      // Создание
      if (!fileToUpload) {
        showToast("Выберите файл для загрузки", "error");
        return;
      }
      try {
        await uploadMediaFile(accessToken, fileToUpload, { altText, caption });
        showToast("Файл загружен", "success");
        setIsModalOpen(false);
        setFileToUpload(null);
        setFilename("");
        setAltText("");
        setCaption("");
        setQuery((prev) => ({ ...prev }));
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось загрузить файл";
        showToast(message, "error");
      }
    }
  };

  const handleDeleteFile = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот файл?")) return;
    try {
      await deleteMediaFile(accessToken, id);
      showToast("Файл удален", "success");
      setQuery((prev) => ({ ...prev }));
      if (editingFile?.id === id) {
        setIsModalOpen(false);
        setEditingFile(null);
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить файл";
      showToast(message, "error");
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteMediaFile(accessToken, id)));
      showToast("Файлы удалены", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить файлы";
      showToast(message, "error");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      if (!editingFile) {
        // При создании используем имя файла
        setFilename(file.name);
      }
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handleFileTypeFilter = (value: string) => {
    setFileTypeFilter(value);
    setQuery((prev) => {
      const newQuery: MediaFilesQuery = { ...prev, page: 1 };
      newQuery.isImage = undefined;
      newQuery.isVideo = undefined;
      newQuery.isAudio = undefined;

      if (value === "image") {
        newQuery.isImage = true;
      } else if (value === "video") {
        newQuery.isVideo = true;
      } else if (value === "audio") {
        newQuery.isAudio = true;
      }
      console.log("handleFileTypeFilter - newQuery:", newQuery);
      return newQuery;
    });
  };

  const handleDateFilter = (value: string) => {
    setDateFilter(value);
    setQuery((prev) => {
      const newQuery: MediaFilesQuery = { ...prev, page: 1 };
      newQuery.sortBy = "uploadedAt";
      newQuery.sortOrder = "desc";

      if (value === "newest") {
        newQuery.sortBy = "uploadedAt";
        newQuery.sortOrder = "desc";
      } else if (value === "oldest") {
        newQuery.sortBy = "uploadedAt";
        newQuery.sortOrder = "asc";
      }
      return newQuery;
    });
  };

  const handleAuthorFilter = (value: string) => {
    setAuthorFilter(value);
    setQuery((prev) => {
      const newQuery: MediaFilesQuery = { ...prev, page: 1 };
      newQuery.uploadedById = undefined;
      
      const adminUserId = 1;

      if (value === "admin") {
        newQuery.uploadedById = adminUserId;
      }
      return newQuery;
    });
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const getFileUrl = (item: MediaFileDto) => {
    // filepath теперь уже содержит полный URL с http://
    if (item.filepath && item.filepath.startsWith('http')) {
      return item.filepath;
    }
    // Fallback для старых записей
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
    // Если filepath это имя файла, используем backend/uploads
    if (item.filepath && !item.filepath.includes('/')) {
      return `${API_URL}/backend/uploads/${item.filepath}`;
    }
    // Если filepath уже содержит путь, используем его
    if (item.filepath && item.filepath.startsWith('/')) {
      return `${API_URL}${item.filepath}`;
    }
    return `${API_URL}/backend/uploads/${item.filepath}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <BlockManagement type={"third"} />

      <div className={styles.toolbar}>
        <div className={styles.searchContainer}>
          <Input
            className={styles.search}
            theme="secondary"
            icon="left"
            placeholder="Поиск"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <UiButton theme="secondary" className={styles.searchButton}>
            Поиск
          </UiButton>
        </div>
        <div className={styles.filters}>
          <Select 
            className={styles.filterSelect} 
            options={[
              { value: "", label: "Файл" },
              { value: "image", label: "Изображения" },
              { value: "video", label: "Видео" },
              { value: "audio", label: "Аудио" }
            ]} 
            value={fileTypeFilter} 
            onChange={(value) => handleFileTypeFilter(value as string)} 
          />
          <Select 
            className={styles.filterSelect} 
            options={[
              { value: "", label: "Автор" },
              { value: "admin", label: "Админ" }
            ]} 
            value={authorFilter} 
            onChange={(value) => handleAuthorFilter(value as string)} 
          />
          <Select 
            className={styles.filterSelect} 
            options={[
              { value: "", label: "Дата" },
              { value: "newest", label: "Новые" },
              { value: "oldest", label: "Старые" }
            ]} 
            value={dateFilter} 
            onChange={(value) => handleDateFilter(value as string)} 
          />
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewButton} ${viewMode === "grid" ? styles.viewButtonActive : ""}`}
            onClick={() => setViewMode("grid")}
            title="Режим карточек"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          </button>
          <button
            className={`${styles.viewButton} ${viewMode === "table" ? styles.viewButtonActive : ""}`}
            onClick={() => setViewMode("table")}
            title="Режим таблицы"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="1" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="1" y1="8" x2="15" y2="8" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="1" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
        <div className={styles.actions}>
          {selectedIds.length > 0 && (
            <PermissionGate resource="mediafiles" level={2}>
              <UiButton theme="warning" onClick={handleDeleteSelected}>
                Выбрано: {selectedIds.length} Удалить
              </UiButton>
            </PermissionGate>
          )}
          {selectedIds.length === 1 && (
            <>
              <UiButton theme="secondary" onClick={() => {
                const file = data.find(f => f.id === selectedIds[0]);
                if (file) window.open(getFileUrl(file), '_blank');
              }}>
                Открыть оригинал
              </UiButton>
              <UiButton theme="secondary" onClick={() => {
                const file = data.find(f => f.id === selectedIds[0]);
                if (file && file.thumbnailUrl) window.open(file.thumbnailUrl, '_blank');
                else if (file) window.open(getFileUrl(file), '_blank');
              }}>
                Открыть миниатюру
              </UiButton>
              <UiButton theme="secondary" onClick={() => {
                const file = data.find(f => f.id === selectedIds[0]);
                if (file) handleEdit(file);
              }}>
                Редактировать
              </UiButton>
            </>
          )}
          <PermissionGate resource="mediafiles" level={2}>
            <UiButton theme="primary" onClick={handleCreate}>
              + Добавить
            </UiButton>
          </PermissionGate>
        </div>
      </div>

      {viewMode === "table" ? (
        <Table className={styles.table}>
          <TableHeader>
            <TableRow>
              <TableHead className={styles.checkboxColumn}>
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Название</TableHead>
              <TableHead>Автор</TableHead>
              <TableHead>Дата</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
            <TableRow 
              key={item.id} 
              className={`${selectedIds.includes(item.id) ? styles.rowSelected : ""} ${styles.clickableRow}`}
              onClick={(e) => {
                // Если клик на чекбокс, только выбираем
                if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('input')) {
                  return;
                }
                // Иначе открываем модалку редактирования
                handleEdit(item);
              }}
            >
              <TableCell className={styles.checkboxColumn} onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => handleToggleSelect(item.id)}
                />
              </TableCell>
              <TableCell>
                <div className={styles.fileCell}>
                  <div className={styles.thumbnail}>
                    {item.isImage ? (
                      <img src={getFileUrl(item)} alt={item.altText || item.filename} />
                    ) : item.isVideo ? (
                      <VideoPlayer src={getFileUrl(item)} width="60px" height="60px" />
                    ) : item.isAudio ? (
                      <AudioPlayer src={getFileUrl(item)} theme="primary" />
                    ) : (
                      <div className={styles.placeholder}>{item.mimetype}</div>
                    )}
                  </div>
                  <span className={styles.filename}>{item.filename}</span>
                </div>
              </TableCell>
              <TableCell>Админ</TableCell>
              <TableCell>{formatDate(item.uploadedAt)}</TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className={styles.grid}>
          {data.map((item) => (
            <div
              key={item.id}
              className={`${styles.card} ${selectedIds.includes(item.id) ? styles.cardSelected : ""}`}
              onClick={(e) => {
                // Если клик на чекбокс, только выбираем
                if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).closest('input')) {
                  handleToggleSelect(item.id);
                } else {
                  // Иначе открываем модалку редактирования
                  handleEdit(item);
                }
              }}
            >
              <div className={styles.cardCheckbox}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggleSelect(item.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className={styles.preview}>
                {item.isImage ? (
                  <img src={getFileUrl(item)} alt={item.altText || item.filename} />
                ) : item.isVideo ? (
                  <VideoPlayer src={getFileUrl(item)} width="100%" height="100%" />
                ) : item.isAudio ? (
                  <AudioPlayer src={getFileUrl(item)} theme="primary" />
                ) : (
                  <div className={styles.placeholder}>{item.mimetype}</div>
                )}
              </div>
              <div className={styles.meta}>
                <div className={styles.filename}>{item.filename || "Название"}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Pagination
          page={query.page || 1}
          total={total}
          perPage={query.limit || 20}
          onChange={handlePageChange}
        />
      </div>

      {isModalOpen && (
        <div className={styles.editModal} onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}>
          <div className={styles.editModalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.editModalHeader}>
              <h2>{editingFile ? "Редактирование файла" : "Загрузка файла"}</h2>
              <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            {editingFile ? (
              <>
                <div className={styles.previewSection}>
                  <div className={styles.previewBox}>
                    {editingFile.isImage ? (
                      <img src={getFileUrl(editingFile)} alt={editingFile.altText || editingFile.filename} />
                    ) : editingFile.isVideo ? (
                      <VideoPlayer src={getFileUrl(editingFile)} width="100%" height="200px" />
                    ) : editingFile.isAudio ? (
                      <AudioPlayer src={getFileUrl(editingFile)} theme="primary" />
                    ) : (
                      <div className={styles.previewPlaceholder}>миниатюра</div>
                    )}
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formField}>
                    <label>Название</label>
                    <Input
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Alt-атрибут</label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Сжатие</label>
                    <Select options={[{ value: "none", label: "Отсутствует" }]} value="none" onChange={() => {}} />
                  </div>
                  <div className={styles.formField}>
                    <label>Размер файла</label>
                    <div className={styles.fileSize}>{formatFileSize(editingFile.fileSize)}</div>
                  </div>
                </div>
                <div className={styles.editModalActions}>
                  <UiButton theme="warning" onClick={() => editingFile && handleDeleteFile(editingFile.id)}>
                    Удалить
                  </UiButton>
                  <UiButton theme="secondary" onClick={() => {
                    if (editingFile) window.open(getFileUrl(editingFile), '_blank');
                  }}>
                    Скачать оригинал
                  </UiButton>
                  <UiButton theme="primary" onClick={handleSave}>
                    Сохранить
                  </UiButton>
                </div>
              </>
            ) : (
              <>
                <div className={styles.previewSection}>
                  <div className={styles.previewBox}>
                    {fileToUpload ? (
                      fileToUpload.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(fileToUpload)} alt="Preview" />
                      ) : fileToUpload.type.startsWith('video/') ? (
                        <VideoPlayer src={URL.createObjectURL(fileToUpload)} width="100%" height="200px" />
                      ) : fileToUpload.type.startsWith('audio/') ? (
                        <AudioPlayer src={URL.createObjectURL(fileToUpload)} theme="primary" />
                      ) : (
                        <div className={styles.previewPlaceholder}>миниатюра</div>
                      )
                    ) : (
                      <div className={styles.previewPlaceholder}>миниатюра</div>
                    )}
                  </div>
                </div>
                <div className={styles.formSection}>
                  <div className={styles.formField}>
                    <label>Файл</label>
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className={styles.fileInput}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Название</label>
                    <Input
                      value={filename}
                      onChange={(e) => setFilename(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Alt-атрибут</label>
                    <Input
                      value={altText}
                      onChange={(e) => setAltText(e.target.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label>Сжатие</label>
                    <Select options={[{ value: "none", label: "Отсутствует" }]} value="none" onChange={() => {}} />
                  </div>
                  {fileToUpload && (
                    <div className={styles.formField}>
                      <label>Размер файла</label>
                      <div className={styles.fileSize}>{formatFileSize(fileToUpload.size)}</div>
                    </div>
                  )}
                </div>
                <div className={styles.editModalActions}>
                  <UiButton theme="primary" onClick={handleSave} disabled={!fileToUpload}>
                    Сохранить
                  </UiButton>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaFilesPage;
