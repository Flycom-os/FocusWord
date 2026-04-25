'use client';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchMediaFiles, MediaFileDto, MediaFilesQuery } from "@/src/shared/api/mediafiles";
import {
  Pagination,
  Modal,
  showToast,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  VideoPlayer,
  AudioPlayer,
} from "@/src/shared/ui";
import styles from "./MediaPickerModal.module.css";

const defaultMediaQuery: MediaFilesQuery = {
  page: 1,
  limit: 20,
  sortBy: "uploadedAt",
  sortOrder: "desc",
};

interface MediaPickerModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (media: MediaFileDto) => void;
}

const getFileUrl = (item: MediaFileDto) => {
  if (item.filepath && item.filepath.startsWith('http')) {
    return item.filepath;
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
  return `${API_URL}/backend/uploads/${item.filepath}`;
};

export const MediaPickerModal = ({ open, onClose, onSelect, zIndex }: MediaPickerModalProps & { zIndex?: number }) => {
  const { accessToken } = useAuth();
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaQuery, setMediaQuery] = useState<MediaFilesQuery>(defaultMediaQuery);

  useEffect(() => {
    if (open) {
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
    }
  }, [accessToken, open, mediaQuery]);

  const handleSelect = (file: MediaFileDto) => {
    onSelect(file);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Выбрать медиа"
      zIndex={zIndex}
    >
      <div className={styles.mediaModalContent}>
        {isLoadingMedia ? (
          <div className={styles.centeredMessage}>
            Загрузка медиафайлов...
          </div>
        ) : mediaFiles.length === 0 ? (
          <div className={styles.centeredMessage}>
            Медиафайлы не найдены
          </div>
        ) : (
          <>
            <div className={styles.mediaGrid}>
              {mediaFiles.map((file) => (
                <div
                  key={file.id}
                  className={styles.mediaCard}
                  onClick={() => handleSelect(file)}
                >
                  <div className={styles.mediaPreview}>
                    {file.isImage ? (
                      <img src={getFileUrl(file)} alt={file.altText || file.filename} />
                    ) : file.isVideo ? (
                      <VideoPlayer src={getFileUrl(file)} width="100%" height="120px" />
                    ) : file.isAudio ? (
                      <AudioPlayer src={getFileUrl(file)} theme="primary" />
                    ) : (
                      <div className={styles.mediaPlaceholder}>{file.mimetype}</div>
                    )}
                  </div>
                  <div className={styles.mediaMeta}>
                    <div className={styles.mediaFilename}>{file.filename}</div>
                  </div>
                </div>
              ))}
            </div>
            {mediaTotal > (mediaQuery.limit ?? 0) && (
              <div className={styles.mediaFooter}>
                <Pagination
                  page={mediaQuery.page || 1}
                  total={mediaTotal}
                  perPage={mediaQuery.limit || 20}
                  onChange={(page) => setMediaQuery((prev) => ({ ...prev, page }))}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

