'use client';

/**
 * @page Records
 */

import { useEffect, useMemo, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/records/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  fetchPages,
  createPage,
  updatePage,
  deletePage,
  publishPage,
  unpublishPage,
  PageDto,
  PagesQuery,
} from "@/src/shared/api/pages";
import { fetchMediaFiles, MediaFileDto, MediaFilesQuery } from "@/src/shared/api/mediafiles";
import {
  Pagination,
  PermissionGate,
  UiButton,
  Modal,
  Notifications,
  showToast,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Select,
} from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery: PagesQuery = {
  page: 1,
  limit: 20,
};

const defaultMediaQuery: MediaFilesQuery = {
  page: 1,
  limit: 50,
  isImage: true,
  sortBy: "uploadedAt",
  sortOrder: "desc",
};

const RecordsPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<PagesQuery>(defaultQuery);
  const [records, setRecords] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PageDto | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaQuery, setMediaQuery] = useState<MediaFilesQuery>(defaultMediaQuery);

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  useEffect(() => {
    const load = async () => {
      console.log('Records: useEffect triggered');
      console.log('Records: accessToken available:', !!accessToken);
      console.log('Records: accessToken length:', accessToken?.length || 0);
      
      if (!accessToken) {
        console.log('Records: No token available, skipping API call');
        return;
      }
      
      console.log('Records: Loading records with token');
      setIsLoading(true);
      try {
        const res = await fetchPages(accessToken, query);
        setRecords(res);
      } catch (error: any) {
        console.error('Records: Error loading records:', error);
        const message = error?.response?.data?.message || "Не удалось загрузить записи";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  useEffect(() => {
    if (isMediaModalOpen) {
      setIsLoadingMedia(true);
      const loadMedia = async () => {
        try {
          const res = await fetchMediaFiles(accessToken, mediaQuery);
          setMediaFiles(res.data);
          setMediaTotal(res.total);
        } catch (error: any) {
          const message = error?.response?.data?.message || "Не удалось загрузить медиафайлы";
          showToast(message, "error");
        } finally {
          setIsLoadingMedia(false);
        }
      };
      loadMedia();
    } else {
      setMediaFiles([]);
      setMediaTotal(0);
    }
  }, [accessToken, isMediaModalOpen, mediaQuery]);

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  const handleCreate = () => {
    setEditingRecord(null);
    setTitle("");
    setSlug("");
    setContent("");
    setStatus("draft");
    setSelectedImageId(null);
    setSeoTitle("");
    setSeoDescription("");
    setIsModalOpen(true);
  };

  const handleEdit = (record: PageDto) => {
    setEditingRecord(record);
    setTitle(record.title);
    setSlug(record.slug);
    setContent(record.content);
    setStatus(record.status);
    setSelectedImageId(record.featuredImageId || null);
    setSeoTitle(record.seoTitle || "");
    setSeoDescription(record.seoDescription || "");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!title || !slug || !content) {
      showToast("Заполните обязательные поля", "error");
      return;
    }
    try {
      if (editingRecord) {
        await updatePage(accessToken, editingRecord.id, {
          title,
          slug,
          content,
          status,
          featuredImageId: selectedImageId || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        });
        showToast("Запись обновлена", "success");
      } else {
        await createPage(accessToken, {
          title,
          slug,
          content,
          status,
          featuredImageId: selectedImageId || undefined,
          seoTitle: seoTitle || undefined,
          seoDescription: seoDescription || undefined,
        });
        showToast("Запись создана", "success");
      }
      setIsModalOpen(false);
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось сохранить запись";
      showToast(message, "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту запись?")) return;
    try {
      await deletePage(accessToken, id);
      showToast("Запись удалена", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить запись";
      showToast(message, "error");
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishPage(accessToken, id);
      showToast("Запись опубликована", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось опубликовать запись";
      showToast(message, "error");
    }
  };

  const handleUnpublish = async (id: number) => {
    try {
      await unpublishPage(accessToken, id);
      showToast("Запись снята с публикации", "success");
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось снять запись с публикации";
      showToast(message, "error");
    }
  };

  const getFileUrl = (item: MediaFileDto) => {
    if (item.filepath && item.filepath.startsWith('http')) {
      return item.filepath;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
    return `${API_URL}/uploads/${item.filepath}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(records.length / query.limit));
  }, [records.length, query.limit]);

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
            placeholder="Поиск записей..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <PermissionGate resource="pages" level={2}>
          <UiButton theme="primary" onClick={handleCreate}>
            Добавить запись
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Дата создания</TableHead>
            <TableHead className={styles.actionsColumn}>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <button
                  className={styles.recordName}
                  onClick={() => handleEdit(record)}
                >
                  {record.title}
                </button>
              </TableCell>
              <TableCell>{record.slug}</TableCell>
              <TableCell>
                <span className={`${styles.status} ${styles[`status${record.status}`]}`}>
                  {record.status === 'published' ? 'Опубликовано' : record.status === 'draft' ? 'Черновик' : record.status}
                </span>
              </TableCell>
              <TableCell>{formatDate(record.createdAt)}</TableCell>
              <TableCell className={styles.actionsColumn}>
                <UiButton theme="secondary" onClick={() => handleEdit(record)}>
                  Редактировать
                </UiButton>
                {record.status === 'published' ? (
                  <PermissionGate resource="pages" level={2}>
                    <UiButton theme="secondary" onClick={() => handleUnpublish(record.id)}>
                      Снять с публикации
                    </UiButton>
                  </PermissionGate>
                ) : (
                  <PermissionGate resource="pages" level={2}>
                    <UiButton theme="primary" onClick={() => handlePublish(record.id)}>
                      Опубликовать
                    </UiButton>
                  </PermissionGate>
                )}
                <PermissionGate resource="pages" level={2}>
                  <UiButton theme="warning" onClick={() => handleDelete(record.id)}>
                    Удалить
                  </UiButton>
                </PermissionGate>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className={styles.footer}>
        <Pagination
          page={query.page || 1}
          total={records.length}
          perPage={query.limit || 20}
          onChange={handlePageChange}
        />
      </div>

      <PermissionGate resource="pages" level={2}>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingRecord ? "Редактировать запись" : "Создать запись"}
        >
          <div className={styles.modalContent}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Название *</label>
              <Input
                className={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Название записи"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Slug *</label>
              <Input
                className={styles.input}
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="slug-zapisi"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Статус</label>
              <Select
                className={styles.input}
                options={[
                  { value: 'draft', label: 'Черновик' },
                  { value: 'published', label: 'Опубликовано' },
                  { value: 'pending', label: 'Ожидает' },
                ]}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Контент *</label>
              <textarea
                className={styles.textarea}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Содержимое записи"
                rows={10}
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Изображение</label>
              <div className={styles.imageSelector}>
                {selectedImageId ? (
                  <div className={styles.selectedImage}>
                    {(() => {
                      const selectedMedia = mediaFiles.find((m) => m.id === selectedImageId);
                      if (selectedMedia) {
                        return <img src={getFileUrl(selectedMedia)} alt={selectedMedia.altText || ""} />;
                      }
                      if (editingRecord?.featuredImage) {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
                        const imageUrl = editingRecord.featuredImage.filepath.startsWith('http')
                          ? editingRecord.featuredImage.filepath
                          : `${API_URL}/uploads/${editingRecord.featuredImage.filepath}`;
                        return <img src={imageUrl} alt={editingRecord.featuredImage.filename} />;
                      }
                      return null;
                    })()}
                    <div className={styles.imageActions}>
                      <UiButton theme="secondary" onClick={() => setIsMediaModalOpen(true)}>
                        Изменить
                      </UiButton>
                      <UiButton theme="warning" onClick={() => setSelectedImageId(null)}>
                        Удалить
                      </UiButton>
                    </div>
                  </div>
                ) : (
                  <UiButton theme="secondary" onClick={() => setIsMediaModalOpen(true)}>
                    Выбрать изображение
                  </UiButton>
                )}
              </div>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>SEO Заголовок</label>
              <Input
                className={styles.input}
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO заголовок"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>SEO Описание</label>
              <textarea
                className={styles.textarea}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="SEO описание"
                rows={3}
              />
            </div>
            <div className={styles.modalFooter}>
              <UiButton theme="secondary" onClick={() => setIsModalOpen(false)}>
                Отмена
              </UiButton>
              <UiButton theme="primary" onClick={handleSave}>
                Сохранить
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>

      <Modal
        open={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Выбрать изображение"
      >
        <div className={styles.mediaModalContent}>
          {isLoadingMedia ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              Загрузка медиафайлов...
            </div>
          ) : mediaFiles.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
              Медиафайлы не найдены
            </div>
          ) : (
            <>
              <div className={styles.mediaGrid}>
                {mediaFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`${styles.mediaCard} ${selectedImageId === file.id ? styles.mediaCardSelected : ""}`}
                    onClick={() => {
                      setSelectedImageId(file.id);
                      setIsMediaModalOpen(false);
                    }}
                  >
                    <div className={styles.mediaPreview}>
                      {file.isImage ? (
                        <img src={getFileUrl(file)} alt={file.altText || file.filename} />
                      ) : (
                        <div className={styles.mediaPlaceholder}>{file.mimetype}</div>
                      )}
                    </div>
                    <div className={styles.mediaMeta}>
                      <div className={styles.mediaFilename}>{file.filename}</div>
                      <div className={styles.mediaCaption}>{file.caption}</div>
                    </div>
                  </div>
                ))}
              </div>
              {mediaTotal > 0 && (
                <div className={styles.mediaFooter}>
                  <Pagination
                    page={mediaQuery.page || 1}
                    total={mediaTotal}
                    perPage={mediaQuery.limit || 50}
                    onChange={(page) => setMediaQuery((prev) => ({ ...prev, page }))}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default RecordsPage;
