"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { updatePage, fetchPage } from "@/src/shared/api/pages";
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from "@/src/shared/api/sliders";
import { PagePreviewModal } from "@/src/widgets/page-preview/PagePreviewModal";
import { PageSlider, Notifications, UiButton, showToast } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import { OutputData } from "@editorjs/editorjs";
import {
  blocksFromPage,
  blocksToMarkdown,
  markdownToBlocks,
  serializePageBlocks,
  type PageBlock,
} from "@/src/shared/lib/page-content";
import { MediaPickerModal } from "@/src/features/Media/ui/MediaPickerModal";
import { fetchCategories, CategoryDto } from "@/src/shared/api/categories";
import { fetchWidgets, WidgetDto } from "@/src/shared/api/widgets";
import { fetchPaymentMethods, PaymentMethodDto } from "@/src/shared/api/payments";
import styles from "../create.module.css";
import DescriptionFieldWrapper from "../DescriptionFieldWrapper";

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
  enableFeedback: boolean;
  paymentMethodId?: number | null;
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
  enableFeedback: true,
  paymentMethodId: null,
};

const EditPagePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [pageId] = useState(params.id);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [widgets, setWidgets] = useState<WidgetDto[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDto[]>([]);
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
      const res = await fetchCategories(1, 100);
      setCategories(res.data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadWidgets = async () => {
    if (!accessToken) return;
    try {
      const res = await fetchWidgets(accessToken, { page: 1, limit: 100 });
      const filtered = (res.data || []).filter(
        (w) =>
          w.slug !== "header" &&
          w.slug !== "footer" &&
          !w.name.toLowerCase().includes("header") &&
          !w.name.toLowerCase().includes("footer")
      );
      setWidgets(filtered);
    } catch (error) {
      console.error("Error loading widgets:", error);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await fetchPaymentMethods(accessToken);
      setPaymentMethods(res.filter((m) => m.isEnabled) || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  useEffect(() => {
    const loadPageData = async () => {
      if (!accessToken || !pageId) return;
      setIsLoading(true);
      try {
        const page = await fetchPage(accessToken, parseInt(pageId, 10));
        setForm({
          title: page.title || "",
          slug: page.slug || "",
          status: page.status || "draft",
          template: page.template || "default",
          seoTitle: page.seoTitle || "",
          seoDescription: page.seoDescription || "",
          metaKeywords: (page.metaKeywords || []).join(", "),
          featuredSliderId: page.featuredSliderId || null,
          categoryIds: (page.categories || []).map((c: any) => c.id),
          enableFeedback: page.enableFeedback !== false, // default true
          paymentMethodId: page.paymentMethodId || null,
        });

        const blocks = blocksFromPage(page);
        setEditorData({ blocks });

        if (page.featuredSliderId) {
          try {
            setSelectedSlider(await getSlider(accessToken, page.featuredSliderId));
          } catch {
            const slider = sliders.find((s) => s.id === page.featuredSliderId);
            setSelectedSlider(slider ? { ...slider, slides: [] } : null);
          }
        }
      } catch {
        showToast("Не удалось загрузить страницу", "error");
        router.push("/admin/pages");
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) {
      loadSliders()
        .then(() => loadCategories())
        .then(() => loadWidgets())
        .then(() => loadPaymentMethods())
        .then(() => loadPageData());
    }
  }, [accessToken, pageId]);

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
            const mediaBlock: PageBlock = {
              id: Date.now().toString(),
              type: "media",
              data: {
                filename: media.filename,
                filepath: media.filepath,
                url: media.filepath,
                caption: media.altText || "",
              },
            };
            const currentBlocks = (editorData?.blocks as PageBlock[]) || [];
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
      const sliderBlock: PageBlock = {
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
      const currentBlocks = (editorData?.blocks as PageBlock[]) || [];
      setEditorData({ blocks: [...currentBlocks, sliderBlock] });
      (window as any).closeSliderModalEdit();
    };

    (window as any).closeSliderModalEdit = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectSliderEdit;
      delete (window as any).closeSliderModalEdit;
    };
  };

  const handleWidgetSelect = () => {
    if (widgets.length === 0) {
      showToast("Сначала создайте виджеты (кроме Header и Footer)", "error");
      return;
    }

    const widgetHtml = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Выберите виджет</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${widgets
              .map(
                (w) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer;"
                   onclick="selectWidgetEdit(${JSON.stringify(w).replace(/"/g, "&quot;")})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${w.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Slug: /${w.slug}</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Тип: ${w.type}</p>
              </div>`,
              )
              .join("")}
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button onclick="closeWidgetModalEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Отмена</button>
          </div>
        </div>
      </div>`;

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = widgetHtml;
    document.body.appendChild(modalDiv);

    (window as any).selectWidgetEdit = (w: WidgetDto) => {
      const widgetBlock: PageBlock = {
        id: Date.now().toString(),
        type: "widget",
        data: {
          slug: w.slug,
          name: w.name,
        },
      };
      const currentBlocks = (editorData?.blocks as PageBlock[]) || [];
      setEditorData({ blocks: [...currentBlocks, widgetBlock] });
      (window as any).closeWidgetModalEdit();
    };

    (window as any).closeWidgetModalEdit = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectWidgetEdit;
      delete (window as any).closeWidgetModalEdit;
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
    if (!accessToken || !pageId) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast("Заголовок и slug обязательны", "error");
      return;
    }
    setIsSaving(true);

    try {
      const blocks = (editorData?.blocks as PageBlock[]) || [];
      await updatePage(accessToken, parseInt(pageId, 10), {
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status,
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        featuredSliderId: form.featuredSliderId || undefined,
        categoryIds: form.categoryIds,
        enableFeedback: form.enableFeedback,
        paymentMethodId: form.paymentMethodId || undefined,
        contentBlocks: blocks.map((block) => ({
          type: block.type,
          id: Date.now() + Math.random(),
          config: block.data,
        })),
        content: blocks.length ? serializePageBlocks(blocks) : "",
      });
      showToast("Страница сохранена", "success");
      router.push("/admin/pages");
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
            onClick={() => router.push("/admin/pages")}
            className={styles.backButton}
          >
            ← Назад к страницам
          </button>
          <h1>Редактировать страницу</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Предпросмотр
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push("/admin/pages")}>
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
              placeholder="Название страницы"
            />

            <div className={styles.editorWrapper}>
              <DescriptionFieldWrapper
                value={editorData?.blocks ? blocksToMarkdown(editorData.blocks as PageBlock[]) : ""}
                onChange={(markdown) => {
                  setEditorData({
                    blocks: markdownToBlocks(markdown, (editorData?.blocks as PageBlock[]) || []),
                  });
                }}
                placeholder="Начните писать контент страницы здесь..."
                id="page-content"
                label="Контент страницы"
                onMediaSelect={handleMediaSelect}
                onSliderSelect={handleSliderSelect}
                onWidgetSelect={handleWidgetSelect}
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

            {/* Checkbox enableFeedback */}
            <div className={styles.formGroup} style={{ display: "flex", alignItems: "center", gap: "8px", margin: "16px 0" }}>
              <input
                type="checkbox"
                id="enableFeedback"
                checked={form.enableFeedback}
                onChange={(e) => setForm((prev) => ({ ...prev, enableFeedback: e.target.checked }))}
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
              />
              <label htmlFor="enableFeedback" className={styles.label} style={{ margin: 0, cursor: "pointer" }}>
                Включить обратную связь
              </label>
            </div>

            {/* Select paymentMethodId */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Способ оплаты (привязать)</label>
              <select
                className={styles.select}
                value={form.paymentMethodId || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethodId: e.target.value ? parseInt(e.target.value, 10) : null }))}
              >
                <option value="">Без платежного метода</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.slug})
                  </option>
                ))}
              </select>
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

      <PagePreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title={form.title}
        slug={form.slug}
        editorData={editorData}
        featuredSlider={selectedSlider}
      />
    </div>
  );
};

export default EditPagePage;
