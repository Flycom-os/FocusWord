import React, { useState, useEffect, useCallback } from "react";
import { Download, Trash2, Eye, ExternalLink, Loader } from "lucide-react";
import Modal from "@/src/shared/ui/Modal/ui-modal";
import Button from "@/src/shared/ui/Button/ui-button";
import Input from "@/src/shared/ui/Input/ui-input";
import styles from "./EditMediaFileModal.module.css";

export interface MediaFile {
  id: number;
  name: string;
  type: string;
  url: string;
  thumbnail: string;
  author: string;
  date: string;
  size: string;
  alt?: string;
  compression?: string;
}

interface EditMediaFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile | null;
  loading?: boolean;
  onSave: (file: MediaFile) => Promise<void>;
  onDelete: (fileId: number) => Promise<void>;
  onDownload: (file: MediaFile) => void;
  onViewOriginal?: (fileId: number) => void;
  onViewThumbnail?: (fileId: number) => void;
}

const compressionOptions = [
  { value: "none", label: "Отсутствует" },
  { value: "low", label: "Низкое" },
  { value: "medium", label: "Среднее" },
  { value: "high", label: "Высокое" },
];

const EditMediaFileModal = ({
                              isOpen,
                              onClose,
                              file,
                              loading = false,
                              onSave,
                              onDelete,
                              onDownload,
                              onViewOriginal,
                              onViewThumbnail,
                            }: EditMediaFileModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    alt: "",
    compression: "none",
  });
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [fullFile, setFullFile] = useState<MediaFile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Стабильная функция обновления формы
  const updateFormData = useCallback((fileData: MediaFile | null) => {
    if (fileData) {
      setFormData({
        name: fileData.name || "",
        alt: fileData.alt || fileData.name || "",
        compression: fileData.compression || "none",
      });
    } else {
      setFormData({
        name: "",
        alt: "",
        compression: "none",
      });
    }
    setImageLoaded(false);
  }, []);

  // Единоразовая установка данных при открытии
  useEffect(() => {
    let cancelled = false;
    const loadFull = async (id: number) => {
      try {
        // set loading state by clearing imageLoaded so placeholder shows
        setImageLoaded(false);
        const res = await fetch(`http://localhost:5000/api/files/get_file_info/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        // normalise shape a bit if backend returns different keys
        const normalized: MediaFile = {
          id: data.id,
          name: data.name || data.filename || '',
          type: data.type || (data.image ? 'image' : 'file'),
          url: data.filepath || data.url || '',
          thumbnail: (data.miniature && data.miniature.filepath) || data.thumbnail || data.filepath || '',
          author: data.author || '—',
          date: data.date || data.createdAt || data.updatedAt || '',
          size: data.size || '—',
          alt: data.alt || '',
          compression: data.compression || 'none',
        };
        setFullFile(normalized);
        updateFormData(normalized);
      } catch (e) {
        console.error('Ошибка при загрузке информации о файле', e);
      }
    };

    if (isOpen) {
      if (file) {
        // load full info from backend for edit mode
        loadFull(file.id);
      } else {
        // create mode - reset form
        updateFormData(null);
      }
    }

    if (!isOpen) {
      // reset local upload state when modal closed
      setLocalFile(null);
      setLocalPreview(null);
      setFullFile(null);
    }

    return () => { cancelled = true; };
  }, [isOpen, file, updateFormData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      // If file exists -> update attributes (and optionally upload new file)
      if (file) {
        const updatedFile = {
          ...file,
          name: formData.name.trim(),
          alt: formData.alt.trim(),
          compression: formData.compression,
        } as MediaFile;
        // If a new file was chosen, upload it first (backend doesn't support multipart PATCH)
        if (localFile) {
          const uploadForm = new FormData();
          uploadForm.append('file', localFile);
          uploadForm.append('name', updatedFile.name);
          try {
            const res = await fetch('http://localhost:5000/api/files/new_file', {
              method: 'POST',
              credentials: 'include',
              body: uploadForm,
            });
            if (res.ok) {
              const created = await res.json();
              await onSave(created);
            } else {
              console.error('Ошибка при загрузке файла', res.status);
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          // Update metadata via PATCH /files/update
          try {
            const payload = {
              file_id: file.id,
              filename: updatedFile.name,
              alt: updatedFile.alt,
              compression: Number(updatedFile.compression) || undefined,
            } as any;
            const res = await fetch('http://localhost:5000/api/files/update', {
              method: 'PATCH',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });
            if (res.ok) {
              const updated = await res.json();
              await onSave(updated);
            } else {
              console.error('Ошибка при обновлении файла', res.status);
            }
          } catch (e) {
            console.error(e);
          }
        }
      } else {
        // Creating new file: must have chosen a file
        if (!localFile) {
          alert('Выберите файл для загрузки');
          return;
        }
        const uploadForm = new FormData();
        uploadForm.append('file', localFile);
        uploadForm.append('name', formData.name.trim() || localFile.name);
        try {
          const res = await fetch('http://localhost:5000/api/files/new_file', {
            method: 'POST',
            credentials: 'include',
            body: uploadForm,
          });
          if (res.ok) {
            const created = await res.json();
            await onSave(created);
          } else {
            console.error('Ошибка при создании файла', res.status);
          }
        } catch (e) {
          console.error(e);
        }
      }
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!file) return;

    if (window.confirm("Вы уверены, что хотите удалить этот файл?")) {
      try {
        setDeleting(true);
        await onDelete(file.id);
        onClose();
      } catch (error) {
        console.error("Ошибка при удалении:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleDownload = () => {
    if (file) {
      onDownload(file);
    }
  };

  const handleViewOriginal = () => {
    if (file && onViewOriginal) {
      onViewOriginal(file.id);
    }
  };

  const handleViewThumbnail = () => {
    if (file && onViewThumbnail) {
      onViewThumbnail(file.id);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/api/placeholder/150/150';
    setImageLoaded(true);
  };

  const handleChooseFile = (file: File | null) => {
    setLocalFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalPreview(url);
      setImageLoaded(true);
    } else {
      setLocalPreview(null);
      setImageLoaded(false);
    }
  };

  // revoke object URL when preview changes or modal closes
  useEffect(() => {
    return () => {
      if (localPreview) {
        try { URL.revokeObjectURL(localPreview); } catch (e) { /* ignore */ }
      }
    };
  }, [localPreview]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={file ? "Редактирование файла" : "Создать файл"}
    >
      <div className={styles.container}>
        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader size={32} className={styles.spinner} />
            <p>Загрузка информации о файле...</p>
          </div>
        ) : (
          <>
            <div className={styles.leftSection}>
              <div className={styles.thumbnailContainer}>
                <div className={`${styles.thumbnailWrapper} ${!imageLoaded ? styles.loading : ''}`}>
                  {localPreview ? (
                    <img src={localPreview} alt={formData.name || 'preview'} className={styles.thumbnail} />
                  ) : fullFile ? (
                    <img
                      src={fullFile.thumbnail}
                      alt={fullFile.name}
                      className={styles.thumbnail}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>Выберите файл для загрузки</div>
                  )}
                  {!imageLoaded && (
                    <div className={styles.imagePlaceholder}>
                      <Loader size={24} className={styles.spinner} />
                    </div>
                  )}
                </div>
                <div className={styles.thumbnailActions}>
                  <Button
                    theme="mini"
                    onClick={handleViewThumbnail}
                    disabled={!imageLoaded || !fullFile}
                  >
                    <Eye size={14} />
                    Просмотр миниатюры
                  </Button>
                  <label className={styles.replaceLabel}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleChooseFile(e.target.files ? e.target.files[0] : null)} />
                    <Button theme="mini">Заменить фото</Button>
                  </label>
                </div>
              </div>

              {fullFile && (
                <div className={styles.fileInfo}>
                  <div className={styles.infoItem}>
                    <strong>Тип:</strong> <span>{fullFile.type}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Автор:</strong> <span>{fullFile.author}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Дата:</strong> <span>{fullFile.date}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Размер:</strong> <span>{fullFile.size}</span>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.rightSection}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Название файла</label>
                <Input
                  theme="primary"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название файла"
                  disabled={saving || deleting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Alt-атрибут</label>
                <Input
                  theme="primary"
                  value={formData.alt}
                  onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Введите alt-атрибут"
                  disabled={saving || deleting}
                />
                <div className={styles.helpText}>
                  Alt-атрибут используется для доступности и SEO
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Уровень сжатия</label>
                <select
                  className={styles.select}
                  value={formData.compression}
                  onChange={(e) => setFormData(prev => ({ ...prev, compression: e.target.value }))}
                  disabled={saving || deleting}
                >
                  {compressionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.previewActions}>
                <Button
                  theme="third"
                  onClick={handleViewOriginal}
                  disabled={saving || deleting}
                >
                  <ExternalLink size={16} />
                  Просмотр оригинала
                </Button>
                <Button
                  theme="third"
                  onClick={handleDownload}
                  disabled={saving || deleting}
                >
                  <Download size={16} />
                  Скачать оригинал
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className={styles.footer}>
        {file ? (
          <>
            <Button
              theme="warning"
              onClick={handleDelete}
              disabled={saving || loading}
            >
              <Trash2 size={16} />
              Удалить файл
            </Button>

            <div className={styles.rightActions}>
              <Button
                theme="secondary"
                onClick={onClose}
                disabled={saving || deleting}
              >
                Отмена
              </Button>
              <Button
                theme="primary"
                onClick={handleSave}
                disabled={deleting || loading || !formData.name.trim()}
              >
                Сохранить изменения
              </Button>
            </div>
          </>
        ) : (
          <div className={styles.rightActions}>
            <Button theme="secondary" onClick={onClose} disabled={saving}>Отмена</Button>
            <Button theme="primary" onClick={handleSave} disabled={saving || !localFile}>Создать файл</Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditMediaFileModal;