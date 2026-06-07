"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchRecord, updateRecord, fetchCategories, CategoryDto } from "@/src/shared/api/records";
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from "@/src/shared/api/sliders";
import { RecordPreviewModal } from "@/src/widgets/record-preview/RecordPreviewModal";
import { PageSlider, Notifications, UiButton, showToast } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import { OutputData } from "@editorjs/editorjs";
import {
  blocksFromRecord,
  blocksToMarkdown,
  markdownToBlocks,
  serializeRecordBlocks,
  type RecordBlock,
} from "@/src/shared/lib/record-content";
import { MediaPickerModal } from "@/src/features/Media/ui/MediaPickerModal";
import styles from "../../create/create.module.css";
import DescriptionFieldWrapper from "../../create/DescriptionFieldWrapper";

type EditorForm = {
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  featuredSliderId?: number | null;
  categoryIds: number[];
};

const defaultForm: EditorForm = {
  title: "",
  slug: "",
  status: "draft",
  template: "default",
  seoTitle: "",
  seoDescription: "",
  metaKeywords: "",
  featuredSliderId: null,
  categoryIds: [],
};

export default function EditRecordPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [recordId] = useState(params.id);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>({ blocks: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{
    onSelect: (media: any) => void;
  } | null>(null);
  const [selectedSlider, setSelectedSlider] = useState<SliderDetailsDto | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const loadSliders = async () => {
    if (!accessToken) return;
    try {
      const res = await fetchSliders(accessToken, { page: 1, limit: 100 });
      setSliders(res.data);
    } catch (error) {
      console.error("Error loading sliders:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetchCategories(1, 100, "");
      setCategories(res.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  useEffect(() => {
    const loadRecordData = async () => {
      if (!accessToken || !recordId) return;
      setIsLoading(true);
      try {
        const record = await fetchRecord(recordId);
        setForm({
          title: record.title || "",
          slug: record.slug || "",
          status: record.status || "draft",
          template: record.template || "default",
          seoTitle: record.seoTitle || "",
          seoDescription: record.seoDescription || "",
          metaKeywords: (record.metaKeywords || []).join(", "),
          featuredSliderId: record.featuredSliderId || null,
          categoryIds: record.categories?.map((cat) => cat.id) || [],
        });

        const blocks = blocksFromRecord(record);
        setEditorData({ blocks });

        if (record.featuredSliderId) {
          try {
            setSelectedSlider(await getSlider(accessToken, record.featuredSliderId));
          } catch {
            const slider = sliders.find((s) => s.id === record.featuredSliderId);
            setSelectedSlider(slider ? { ...slider, slides: [] } : null);
          }
        }
      } catch {
        showToast("Не удалось загрузить запись", "error");
        router.push("/admin/records");
      } finally {
        setIsLoading(false);
      }
    };

    loadSliders()
      .then(() => loadCategories())
      .then(() => loadRecordData());
  }, [accessToken, recordId]);

  useEffect(() => {
    const handleOpenMediaPicker = (event: CustomEvent) => {
      setMediaPickerCallback({ onSelect: event.detail.onSelect });
      setIsMediaPickerOpen(true);
    };

    window.addEventListener("open-media-picker", handleOpenMediaPicker as EventListener);
    return () => {
      window.removeEventListener("open-media-picker", handleOpenMediaPicker as EventListener);
    };
  }, []);

  const handleMediaSelect = () => {
    window.dispatchEvent(
      new CustomEvent("open-media-picker", {
        detail: {
          onSelect: (media: any) => {
            const mediaBlock: RecordBlock = {
              id: Date.now().toString(),
              type: "media",
              data: {
                filename: media.filename,
                filepath: media.filepath,
                url: media.filepath,
                caption: media.altText || "",
              },
            };
            const currentBlocks = (editorData?.blocks as RecordBlock[]) || [];
            setEditorData({ blocks: [...currentBlocks, mediaBlock] });
          },
        },
      }),
    );
  };

  const handleSliderSelect = () => {
    if (sliders.length === 0) {
      showToast("Сначала создайте слайдеры", "error");
      return;
    }

    const sliderHtml = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Выберите слайдер</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sliders
              .map(
                (slider) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer;"
                   onclick="selectSliderEdit(${JSON.stringify(slider).replace(/"/g, "&quot;")})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${slider.name}</h4>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Slug: /${slider.slug}</p>
              </div>`,
              )
              .join("")}
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button onclick="closeSliderModalEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Отмена</button>
          </div>
        </div>
      </div>`;

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = sliderHtml;
    document.body.appendChild(modalDiv);

    (window as any).selectSliderEdit = (slider: SliderDto) => {
      const sliderBlock: RecordBlock = {
        id: Date.now().toString(),
        type: "slider",
        data: {
          sliderId: slider.id,
          id: slider.id,
          name: slider.name,
          slug: slider.slug,
          description: slider.description,
        },
      };
      const currentBlocks = (editorData?.blocks as RecordBlock[]) || [];
      setEditorData({ blocks: [...currentBlocks, sliderBlock] });
      (window as any).closeSliderModalEdit();
    };

    (window as any).closeSliderModalEdit = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectSliderEdit;
      delete (window as any).closeSliderModalEdit;
    };
  };

  const handlePreview = () => {
    if (!editorData?.blocks?.length && !form.title.trim()) {
      showToast("Заполните заголовок или контент для предпросмотра", "error");
      return;
    }
    setShowPreview(true);
  };

  const handleSliderChange = async (sliderId: string) => {
    if (!sliderId || !accessToken) {
      setSelectedSlider(null);
      return;
    }
    const id = parseInt(sliderId, 10);
    try {
      setSelectedSlider(await getSlider(accessToken, id));
    } catch {
      const slider = sliders.find((s) => s.id === id);
      setSelectedSlider(slider ? { ...slider, slides: [] } : null);
    }
  };

  const handleSave = async () => {
    if (!accessToken || !recordId) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast("Заголовок и slug обязательны", "error");
      return;
    }
    setIsSaving(true);

    try {
      const blocks = (editorData?.blocks as RecordBlock[]) || [];
      await updateRecord(accessToken, recordId, {
        id: parseInt(recordId, 10),
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status as "draft" | "published",
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        featuredSliderId: form.featuredSliderId || undefined,
        categoryIds: form.categoryIds,
        contentBlocks: blocks.map((block) => ({
          type: block.type,
          id: Date.now() + Math.random(),
          config: block.data,
        })),
        content: blocks.length ? serializeRecordBlocks(blocks) : "",
      });
      showToast("Запись сохранена", "success");
      router.push("/admin/records");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Ошибка сохранения", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Notifications />
      <MediaPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => {
          mediaPickerCallback?.onSelect(media);
          setIsMediaPickerOpen(false);
        }}
        zIndex={2001}
      />

      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button
            type="button"
            onClick={() => router.push("/admin/records")}
            className={styles.backButton}
          >
            ← Назад к записям
          </button>
          <h1>Редактировать запись</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Предпросмотр
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push("/admin/records")}>
            Отмена
          </UiButton>
          <UiButton theme="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Сохранение..." : "Сохранить"}
          </UiButton>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <Input
              className={styles.input}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Название записи"
            />

            <div className={styles.editorWrapper}>
              <DescriptionFieldWrapper
                value={
                  editorData?.blocks ? blocksToMarkdown(editorData.blocks as RecordBlock[]) : ""
                }
                onChange={(markdown) => {
                  setEditorData({
                    blocks: markdownToBlocks(markdown, (editorData?.blocks as RecordBlock[]) || []),
                  });
                }}
                placeholder="Начните писать контент записи здесь..."
                id="record-content"
                label="Контент записи"
                onMediaSelect={handleMediaSelect}
                onSliderSelect={handleSliderSelect}
              />
            </div>
          </div>

          <div className={styles.sideCol}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Статус</label>
              <select
                className={styles.select}
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Шаблон</label>
              <Input
                value={form.template}
                onChange={(e) => setForm((prev) => ({ ...prev, template: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO заголовок</label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO описание</label>
              <textarea
                className={styles.textarea}
                value={form.seoDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ключевые слова (через запятую)</label>
              <Input
                value={form.metaKeywords}
                onChange={(e) => setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Категории</label>
              <div className={styles.categoriesContainer}>
                {categories.map((category) => (
                  <label key={category.id} className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm((prev) => ({
                            ...prev,
                            categoryIds: [...prev.categoryIds, category.id],
                          }));
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            categoryIds: prev.categoryIds.filter((id) => id !== category.id),
                          }));
                        }
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Основной слайдер</label>
              <select
                className={styles.select}
                value={form.featuredSliderId?.toString() || ""}
                onChange={(e) => {
                  setForm((prev) => ({
                    ...prev,
                    featuredSliderId: e.target.value ? parseInt(e.target.value, 10) : null,
                  }));
                  handleSliderChange(e.target.value);
                }}
              >
                <option value="">Без слайдера</option>
                {sliders.map((slider) => (
                  <option key={slider.id} value={slider.id.toString()}>
                    {slider.name}
                  </option>
                ))}
              </select>

              {selectedSlider?.slides && selectedSlider.slides.length > 0 && (
                <div className={styles.sliderPreview}>
                  <h4>Слайдер: {selectedSlider.name}</h4>
                  <PageSlider slider={selectedSlider as any} autoPlay showArrows showDots />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RecordPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={form.title}
        slug={form.slug}
        editorData={editorData}
        featuredSlider={selectedSlider}
      />
    </div>
  );
}
