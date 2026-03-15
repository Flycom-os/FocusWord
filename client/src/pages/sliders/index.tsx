'use client';

/**
 * @page Sliders
 */

import { useEffect, useMemo, useState } from "react";
import BlockManagement from "@/src/widgets/block_management";
import styles from "@/src/pages/sliders/index.module.css";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  fetchSliders,
  createSlider,
  updateSlider,
  deleteSlider,
  fetchSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  SliderDto,
  SlideDto,
  SliderQuery,
} from "@/src/shared/api/sliders";
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
  VideoPlayer,
  AudioPlayer,
} from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";

const defaultQuery: SliderQuery = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultMediaQuery: MediaFilesQuery = {
  page: 1,
  limit: 50,
  sortBy: "uploadedAt",
  sortOrder: "desc",
};

const SlidersPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<SliderQuery>(defaultQuery);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSliderId, setSelectedSliderId] = useState<number | null>(null);
  const [slides, setSlides] = useState<SlideDto[]>([]);
  const [slidesTotal, setSlidesTotal] = useState(0);
  const [slidesQuery, setSlidesQuery] = useState<SliderQuery>({ page: 1, limit: 20 });
  const [isSliderModalOpen, setIsSliderModalOpen] = useState(false);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<SliderDto | null>(null);
  const [editingSlide, setEditingSlide] = useState<SlideDto | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFileDto[]>([]);
  const [mediaTotal, setMediaTotal] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaQuery, setMediaQuery] = useState<MediaFilesQuery>(defaultMediaQuery);

  // Form states
  const [sliderName, setSliderName] = useState("");
  const [sliderSlug, setSliderSlug] = useState("");
  const [sliderDescription, setSliderDescription] = useState("");
  const [slideTitle, setSlideTitle] = useState("");
  const [slideDescription, setSlideDescription] = useState("");
  const [slideLinkUrl, setSlideLinkUrl] = useState("");
  const [slideSortOrder, setSlideSortOrder] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(total / query.limit));
  }, [total, query.limit]);

  const slidesTotalPages = useMemo(() => {
    if (!slidesQuery.limit) return 1;
    return Math.max(1, Math.ceil(slidesTotal / slidesQuery.limit));
  }, [slidesTotal, slidesQuery.limit]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchSliders(accessToken, query);
        setSliders(res.data);
        setTotal(res.total);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось загрузить слайдеры";
        showToast(message, "error");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [accessToken, query]);

  useEffect(() => {
    if (selectedSliderId) {
      const loadSlides = async () => {
        try {
          const res = await fetchSlides(accessToken, selectedSliderId, slidesQuery);
          setSlides(res.data);
          setSlidesTotal(res.total);
        } catch (error: any) {
          const message = error?.response?.data?.message || "Не удалось загрузить слайды";
          showToast(message, "error");
        }
      };
      loadSlides();
    } else {
      setSlides([]);
      setSlidesTotal(0);
    }
  }, [accessToken, selectedSliderId, slidesQuery]);

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

  const handleSlidesPageChange = (page: number) => {
    setSlidesQuery((prev) => ({ ...prev, page }));
  };

  const handleCreateSlider = () => {
    setEditingSlider(null);
    setSliderName("");
    setSliderSlug("");
    setSliderDescription("");
    setIsSliderModalOpen(true);
  };

  const handleEditSlider = (slider: SliderDto) => {
    setEditingSlider(slider);
    setSliderName(slider.name);
    setSliderSlug(slider.slug);
    setSliderDescription(slider.description || "");
    setIsSliderModalOpen(true);
  };

  const handleSaveSlider = async () => {
    if (!sliderName || !sliderSlug) {
      showToast("Заполните обязательные поля", "error");
      return;
    }
    try {
      if (editingSlider) {
        await updateSlider(accessToken, editingSlider.id, {
          name: sliderName,
          slug: sliderSlug,
          description: sliderDescription || undefined,
        });
        showToast("Слайдер обновлен", "success");
      } else {
        await createSlider(accessToken, {
          name: sliderName,
          slug: sliderSlug,
          description: sliderDescription || undefined,
        });
        showToast("Слайдер создан", "success");
      }
      setIsSliderModalOpen(false);
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось сохранить слайдер";
      showToast({ type: "error", message });
    }
  };

  const handleDeleteSlider = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот слайдер?")) return;
    try {
      await deleteSlider(accessToken, id);
      showToast("Слайдер удален", "success");
      if (selectedSliderId === id) {
        setSelectedSliderId(null);
      }
      setQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить слайдер";
      showToast({ type: "error", message });
    }
  };

  const handleCreateSlide = () => {
    if (!selectedSliderId) {
      showToast("Выберите слайдер", "error");
      return;
    }
    setEditingSlide(null);
    setSlideTitle("");
    setSlideDescription("");
    setSlideLinkUrl("");
    setSlideSortOrder(0);
    setSelectedImageId(null);
    setIsSlideModalOpen(true);
  };

  const handleEditSlide = (slide: SlideDto) => {
    setEditingSlide(slide);
    setSlideTitle(slide.title || "");
    setSlideDescription(slide.description || "");
    setSlideLinkUrl(slide.linkUrl || "");
    setSlideSortOrder(slide.sortOrder);
    setSelectedImageId(slide.imageId || null);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async () => {
    if (!selectedSliderId) return;
    try {
      if (editingSlide) {
        await updateSlide(accessToken, selectedSliderId, editingSlide.id, {
          title: slideTitle || undefined,
          description: slideDescription || undefined,
          linkUrl: slideLinkUrl || undefined,
          sortOrder: slideSortOrder,
          imageId: selectedImageId || undefined,
        });
        showToast("Слайд обновлен", "success");
      } else {
        await createSlide(accessToken, selectedSliderId, {
          title: slideTitle || undefined,
          description: slideDescription || undefined,
          linkUrl: slideLinkUrl || undefined,
          sortOrder: slideSortOrder,
          imageId: selectedImageId || undefined,
        });
        showToast("Слайд создан", "success");
      }
      setIsSlideModalOpen(false);
      setSlidesQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось сохранить слайд";
      showToast({ type: "error", message });
    }
  };

  const handleDeleteSlide = async (slideId: number) => {
    if (!selectedSliderId) return;
    if (!confirm("Вы уверены, что хотите удалить этот слайд?")) return;
    try {
      await deleteSlide(accessToken, selectedSliderId, slideId);
      showToast("Слайд удален", "success");
      setSlidesQuery((prev) => ({ ...prev }));
    } catch (error: any) {
      const message = error?.response?.data?.message || "Не удалось удалить слайд";
      showToast({ type: "error", message });
    }
  };

  const getFileUrl = (item: MediaFileDto) => {
    if (item.filepath && item.filepath.startsWith('http')) {
      return item.filepath;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
    return `${API_URL}/uploads/${item.filepath}`;
  };

  const getSlideMediaPreview = (slide: SlideDto) => {
    if (slide.image) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
      const imageUrl = slide.image.filepath.startsWith('http')
        ? slide.image.filepath
        : `${API_URL}/uploads/${slide.image.filepath}`;
      return <img src={imageUrl} alt={slide.image.filename} className={styles.slidePreview} />;
    }
    return <div className={styles.slidePreviewPlaceholder}>Нет изображения</div>;
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
            placeholder="Поиск слайдеров..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <PermissionGate resource="sliders" level={2}>
          <UiButton theme="primary" onClick={handleCreateSlider}>
            Добавить слайдер
          </UiButton>
        </PermissionGate>
      </div>

      <div className={styles.content}>
        <div className={styles.slidersSection}>
          <h2 className={styles.sectionTitle}>Слайдеры</h2>
          <Table className={styles.table}>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Описание</TableHead>
                <TableHead className={styles.actionsColumn}>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sliders.map((slider) => (
                <TableRow
                  key={slider.id}
                  className={selectedSliderId === slider.id ? styles.selectedRow : ""}
                  onClick={() => setSelectedSliderId(slider.id)}
                >
                  <TableCell>{slider.name}</TableCell>
                  <TableCell>{slider.slug}</TableCell>
                  <TableCell>{slider.description || '-'}</TableCell>
                  <TableCell className={styles.actionsColumn} onClick={(e) => e.stopPropagation()}>
                    <PermissionGate resource="sliders" level={1}>
                      <UiButton theme="secondary" onClick={() => handleEditSlider(slider)}>
                        Редактировать
                      </UiButton>
                    </PermissionGate>
                    <PermissionGate resource="sliders" level={2}>
                      <UiButton theme="warning" onClick={() => handleDeleteSlider(slider.id)}>
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
              total={total}
              perPage={query.limit || 20}
              onChange={handlePageChange}
            />
          </div>
        </div>

        {selectedSliderId && (
          <div className={styles.slidesSection}>
            <div className={styles.slidesHeader}>
              <h2 className={styles.sectionTitle}>Слайды</h2>
              <PermissionGate resource="sliders" level={2}>
                <UiButton theme="primary" onClick={handleCreateSlide}>
                  Добавить слайд
                </UiButton>
              </PermissionGate>
            </div>
            <Table className={styles.table}>
              <TableHeader>
                <TableRow>
                  <TableHead>Медиа</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Описание</TableHead>
                  <TableHead>Ссылка</TableHead>
                  <TableHead>Порядок</TableHead>
                  <TableHead className={styles.actionsColumn}>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      {getSlideMediaPreview(slide)}
                    </TableCell>
                    <TableCell>{slide.title || '-'}</TableCell>
                    <TableCell>{slide.description || '-'}</TableCell>
                    <TableCell>{slide.linkUrl || '-'}</TableCell>
                    <TableCell>{slide.sortOrder}</TableCell>
                    <TableCell className={styles.actionsColumn}>
                      <PermissionGate resource="sliders" level={1}>
                        <UiButton theme="secondary" onClick={() => handleEditSlide(slide)}>
                          Редактировать
                        </UiButton>
                      </PermissionGate>
                      <PermissionGate resource="sliders" level={2}>
                        <UiButton theme="warning" onClick={() => handleDeleteSlide(slide.id)}>
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
                page={slidesQuery.page || 1}
                total={slidesTotal}
                perPage={slidesQuery.limit || 20}
                onChange={handleSlidesPageChange}
              />
            </div>
          </div>
        )}
      </div>

      <PermissionGate resource="sliders" level={2}>
        <Modal
          open={isSliderModalOpen}
          onClose={() => setIsSliderModalOpen(false)}
          title={editingSlider ? "Редактировать слайдер" : "Создать слайдер"}
        >
          <div className={styles.modalContent}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Название *</label>
              <Input
                className={styles.input}
                value={sliderName}
                onChange={(e) => setSliderName(e.target.value)}
                placeholder="Название слайдера"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Slug *</label>
              <Input
                className={styles.input}
                value={sliderSlug}
                onChange={(e) => setSliderSlug(e.target.value)}
                placeholder="slug-slidera"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Описание</label>
              <Input
                className={styles.input}
                value={sliderDescription}
                onChange={(e) => setSliderDescription(e.target.value)}
                placeholder="Описание слайдера"
              />
            </div>
            <div className={styles.modalFooter}>
              <UiButton theme="secondary" onClick={() => setIsSliderModalOpen(false)}>
                Отмена
              </UiButton>
              <UiButton theme="primary" onClick={handleSaveSlider}>
                Сохранить
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>

      <PermissionGate resource="sliders" level={2}>
        <Modal
          open={isSlideModalOpen}
          onClose={() => setIsSlideModalOpen(false)}
          title={editingSlide ? "Редактировать слайд" : "Создать слайд"}
        >
          <div className={styles.modalContent}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Название</label>
              <Input
                className={styles.input}
                value={slideTitle}
                onChange={(e) => setSlideTitle(e.target.value)}
                placeholder="Название слайда"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Описание</label>
              <Input
                className={styles.input}
                value={slideDescription}
                onChange={(e) => setSlideDescription(e.target.value)}
                placeholder="Описание слайда"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Ссылка</label>
              <Input
                className={styles.input}
                value={slideLinkUrl}
                onChange={(e) => setSlideLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Порядок сортировки</label>
              <Input
                className={styles.input}
                type="number"
                value={slideSortOrder}
                onChange={(e) => setSlideSortOrder(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Медиа</label>
              <div className={styles.imageSelector}>
                {selectedImageId ? (
                  <div className={styles.selectedImage}>
                    {(() => {
                      const selectedMedia = mediaFiles.find((m) => m.id === selectedImageId);
                      if (selectedMedia) {
                        if (selectedMedia.isImage) {
                          return <img src={getFileUrl(selectedMedia)} alt={selectedMedia.altText || ""} />;
                        } else if (selectedMedia.isVideo) {
                          return <VideoPlayer src={getFileUrl(selectedMedia)} width="100%" height="150px" />;
                        } else if (selectedMedia.isAudio) {
                          return <AudioPlayer src={getFileUrl(selectedMedia)} theme="primary" />;
                        }
                      }
                      if (editingSlide?.image) {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
                        const imageUrl = editingSlide.image.filepath.startsWith('http')
                          ? editingSlide.image.filepath
                          : `${API_URL}/uploads/${editingSlide.image.filepath}`;
                        return <img src={imageUrl} alt={editingSlide.image.filename} />;
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
                    Выбрать медиа
                  </UiButton>
                )}
              </div>
            </div>
            <div className={styles.modalFooter}>
              <UiButton theme="secondary" onClick={() => setIsSlideModalOpen(false)}>
                Отмена
              </UiButton>
              <UiButton theme="primary" onClick={handleSaveSlide}>
                Сохранить
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>

      <Modal
        open={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        title="Выбрать медиа"
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

export default SlidersPage;

