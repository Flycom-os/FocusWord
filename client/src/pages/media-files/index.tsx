'use client';

/**
 * @page MediaFiles
 */

import { useEffect, useMemo, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/media-files/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import { deleteMediaFile, fetchMediaFiles, MediaFileDto, MediaFilesQuery, uploadMediaFile } from "@/src/shared/api/mediafiles";
import { Pagination, PermissionGate, UiButton, Modal, Notifications, showToast } from "@/src/shared/ui";
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");

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
        showToast({ type: "error", message });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map((id) => deleteMediaFile(accessToken, id)));
      showToast({ type: "success", message: "Файлы удалены" });
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить файлы";
      showToast({ type: "error", message });
    }
  };

  const handleUpload = async () => {
    if (!fileToUpload) return;
    try {
      await uploadMediaFile(accessToken, fileToUpload, { altText, caption });
      showToast({ type: "success", message: "Файл загружен" });
      setIsUploadOpen(false);
      setFileToUpload(null);
      setAltText("");
      setCaption("");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось загрузить файл";
      showToast({ type: "error", message });
    }
  };

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <BlockManagement type={"third"} />

      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          theme="secondary"
          icon="left"
          placeholder="Поиск по названию или описанию"
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <PermissionGate resource="mediafiles" level={2}>
          <UiButton theme="primary" onClick={() => setIsUploadOpen(true)}>
            Добавить
          </UiButton>
        </PermissionGate>
      </div>

      <div className={styles.grid}>
        {data.map((item) => (
          <div
            key={item.id}
            className={`${styles.card} ${selectedIds.includes(item.id) ? styles.cardSelected : ""}`}
            onClick={() => handleToggleSelect(item.id)}
          >
            <div className={styles.preview}>
              {item.isImage ? (
                <img src={`/backend/uploads/${item.filename}`} alt={item.altText || item.filename} />
              ) : (
                <div className={styles.placeholder}>{item.mimetype}</div>
              )}
            </div>
            <div className={styles.meta}>
              <div className={styles.filename}>{item.filename}</div>
              <div className={styles.caption}>{item.caption}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <PermissionGate resource="mediafiles" level={2}>
          <UiButton theme="warning" disabled={!selectedIds.length} onClick={handleDeleteSelected}>
            Удалить выбранные ({selectedIds.length})
          </UiButton>
        </PermissionGate>
        <Pagination
          currentPage={query.page || 1}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      <PermissionGate resource="mediafiles" level={2}>
        <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)}>
          <div className={styles.modalContent}>
            <h2>Загрузка файла</h2>
            <input
              type="file"
              onChange={(e) => setFileToUpload(e.target.files?.[0] || null)}
            />
            <Input
              className={styles.input}
              placeholder="Alt-текст"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
            />
            <Input
              className={styles.input}
              placeholder="Подпись"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <UiButton theme="primary" onClick={handleUpload} disabled={!fileToUpload}>
              Загрузить
            </UiButton>
          </div>
        </Modal>
      </PermissionGate>
    </div>
  );
};

export default MediaFilesPage;
