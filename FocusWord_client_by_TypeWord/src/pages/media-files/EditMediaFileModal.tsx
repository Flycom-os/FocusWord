import React, { useState, useEffect, useCallback } from "react";
import { Download, Trash2, ExternalLink, Loader } from "lucide-react";
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
}

const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

const EditMediaFileModal = ({
                              isOpen,
                              onClose,
                              file,
                              loading = false,
                              onSave,
                              onDelete,
                              onDownload,
                              onViewOriginal,
                            }: EditMediaFileModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    alt: "",
    compression: 0,
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
        compression: parseInt(fileData.compression || "0") || 0,
      });
    } else {
      setFormData({
        name: "",
        alt: "",
        compression: 0,
      });
    }
    setImageLoaded(false);
  }, []);

  // Единоразовая установка данных при открытии
  useEffect(() => {
    let cancelled = false;
    const loadFull = async (id: number) => {
      try {
        setImageLoaded(false);
        const res = await fetch(`http://localhost:5000/api/files/get_file_info/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
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
          compression: data.compression || '0',
        };
        setFullFile(normalized);
        updateFormData(normalized);
      } catch (e) {
        console.error('Ошибка при загрузке информации о файле', e);
      }
    };

    if (isOpen) {
      if (file) {
        loadFull(file.id);
        setLocalFile(null);
        setLocalPreview(null);
      } else {
        updateFormData(null);
      }
    }

    if (!isOpen) {
      setLocalFile(null);
      setLocalPreview(null);
      setFullFile(null);
    }

    return () => { cancelled = true; };
  }, [isOpen, file, updateFormData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (file) {
        const updatedFile = {
          ...file,
          name: formData.name.trim(),
          alt: formData.alt.trim(),
          compression: formData.compression, // Убрано toString()
        } as MediaFile;
        if (!formData.name.trim()) {
          alert('Пожалуйста, введите название файла');
          return;
        }
        const payload = {
          file_id: file.id,
          filename: updatedFile.name,
          alt: updatedFile.alt,
          compression: updatedFile.compression, // Отправка как число
        };
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
          const errorText = await res.text();
          alert(`Ошибка при обновлении файла: ${errorText || res.status}`);
          return;
        }
      } else {
        if (!localFile) {
          alert('Выберите файл для загрузки');
          return;
        }
        if (!formData.name.trim()) {
          alert('Пожалуйста, введите название файла');
          return;
        }
        const uploadForm = new FormData();
        uploadForm.append('file', localFile);
        uploadForm.append('filename', formData.name.trim());
        uploadForm.append('compression', formData.compression.toString()); // Оставлено как строка для POST
        console.log('Отправка FormData:', { filename: formData.name.trim(), file: localFile.name, compression: formData.compression });
        const res = await fetch('http://localhost:5000/api/files/new_file', {
          method: 'POST',
          credentials: 'include',
          body: uploadForm,
        });
        if (res.ok) {
          const created = await res.json();
          await onSave(created);
        } else {
          const errorText = await res.text();
          alert(`Ошибка при создании файла: ${errorText || res.status}`);
          return;
        }
      }
      onClose();
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert(`Произошла ошибка: ${error.message}`);
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
        alert(`Произошла ошибка при удалении: ${error.message}`);
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

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    (e.target as HTMLImageElement).src = '/api/placeholder/150/150';
    setImageLoaded(true);
  };

  const handleChooseFile = (file: File | null) => {
    if (file && !allowedFileTypes.includes(file.type)) {
      if (file.type === 'image/svg+xml') {
        alert('Файлы SVG не поддерживаются. Пожалуйста, выберите файл формата JPG, PNG или GIF.');
      } else {
        alert('Неподдерживаемый формат файла. Пожалуйста, выберите файл формата JPG, PNG или GIF.');
      }
      return;
    }
    console.log('Выбранный файл:', file);
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
                  {file && fullFile ? (
                    <img
                      src={fullFile.thumbnail}
                      alt={fullFile.name}
                      className={styles.thumbnail}
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  ) : localPreview ? (
                    <img src={localPreview} alt={formData.name || 'preview'} className={styles.thumbnail} />
                  ) : (
                    <div className={styles.thumbnailPlaceholder}>Выберите файл для загрузки</div>
                  )}
                  {!imageLoaded && (
                    <div className={styles.imagePlaceholder}>
                      <Loader size={24} className={styles.spinner} />
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>{file ? "Просмотр файла" : "Выберите файл"}</label>
                  {file ? null : (
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif"
                      onChange={(e) => handleChooseFile(e.target.files ? e.target.files[0] : null)}
                    />
                  )}
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
                <label className={styles.label}>Уровень сжатия (0-100)</label>
                <Input
                  theme="primary"
                  type="number"
                  value={formData.compression}
                  onChange={(e) => {
                    const value = Math.max(0, Math.min(100, parseInt(e.target.value) || 0));
                    setFormData(prev => ({ ...prev, compression: value }));
                  }}
                  min="0"
                  max="100"
                  disabled={saving || deleting}
                />
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
            <Button
              theme="primary"
              onClick={handleSave}
              disabled={saving || !localFile || !formData.name.trim()}
            >
              Создать файл
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default EditMediaFileModal;