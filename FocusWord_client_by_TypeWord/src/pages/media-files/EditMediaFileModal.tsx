import React, { useState, useEffect } from "react";
import { Download, Trash2 } from "lucide-react";
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
  onSave: (file: MediaFile) => void;
  onDelete: (fileId: number) => void;
  onDownload: (file: MediaFile) => void;
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
  onSave,
  onDelete,
  onDownload,
}: EditMediaFileModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    alt: "",
    compression: "none",
  });

  useEffect(() => {
    if (file) {
      setFormData({
        name: file.name,
        alt: file.alt || file.name,
        compression: file.compression || "none",
      });
    }
  }, [file]);

  const handleSave = () => {
    if (file) {
      const updatedFile = {
        ...file,
        name: formData.name,
        alt: formData.alt,
        compression: formData.compression,
      };
      onSave(updatedFile);
      onClose();
    }
  };

  const handleDelete = () => {
    if (file && window.confirm("Вы уверены, что хотите удалить этот файл?")) {
      onDelete(file.id);
      onClose();
    }
  };

  const handleDownload = () => {
    if (file) {
      onDownload(file);
    }
  };

  if (!file) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактирование файла">
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.thumbnailContainer}>
            <img
              src={file.thumbnail}
              alt={file.name}
              className={styles.thumbnail}
            />
            <div className={styles.thumbnailPlaceholder}>
              миниатюра
            </div>
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название</label>
            <Input
              theme="primary"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название файла"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Alt-атрибут</label>
            <Input
              theme="primary"
              value={formData.alt}
              onChange={(e) => setFormData(prev => ({ ...prev, alt: e.target.value }))}
              placeholder="Введите alt-атрибут"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Сжатие</label>
            <select
              className={styles.select}
              value={formData.compression}
              onChange={(e) => setFormData(prev => ({ ...prev, compression: e.target.value }))}
            >
              {compressionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Размер файла</label>
            <div className={styles.fileSize}>{file.size}</div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <Button theme="warning" onClick={handleDelete}>
          <Trash2 size={16} />
          Удалить
        </Button>
        
        <div className={styles.rightActions}>
          <button className={styles.downloadLink} onClick={handleDownload}>
            Скачать оригинал
          </button>
          <Button theme="secondary" onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditMediaFileModal;
