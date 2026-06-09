"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { updateArticle, fetchArticle } from "@/src/shared/api/articles";
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from "@/src/shared/api/sliders";
import { ArticlePreviewModal } from "@/src/widgets/article-preview/ArticlePreviewModal";
import { PageSlider, Notifications, UiButton, showToast } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import { OutputData } from "@editorjs/editorjs";
import {
  blocksFromArticle,
  blocksToMarkdown,
  markdownToBlocks,
  serializeArticleBlocks,
  type ArticleBlock,
} from "@/src/shared/lib/article-content";
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

const EditArticlePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [articleId] = useState(params.id);
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
    const loadArticleData = async () => {
      if (!accessToken || !articleId) return;
      setIsLoading(true);
      try {
        const article = await fetchArticle(accessToken, parseInt(articleId, 10));
        setForm({
          title: article.title || "",
          slug: article.slug || "",
          status: article.status || "draft",
          template: article.template || "default",
          seoTitle: article.seoTitle || "",
          seoDescription: article.seoDescription || "",
          metaKeywords: (article.metaKeywords || []).join(", "),
          featuredSliderId: article.featuredSliderId || null,
          categoryIds: (article.categories || []).map((c: any) => c.id),
          enableFeedback: article.enableFeedback ?? true,
          paymentMethodId: article.paymentMethodId || null,
        });

        const blocks = blocksFromArticle(article);
        setEditorData({ blocks });

        if (article.featuredSliderId) {
          try {
            setSelectedSlider(await getSlider(accessToken, article.featuredSliderId));
          } catch {
            const slider = sliders.find((s) => s.id === article.featuredSliderId);
            setSelectedSlider(slider ? { ...slider, slides: [] } : null);
          }
        }
      } catch {
        showToast("Failed to load article", "error");
        router.push("/admin/articles");
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken && articleId) {
      Promise.all([
        loadSliders(),
        loadCategories(),
        loadWidgets(),
        loadPaymentMethods(),
      ]).then(() => {
        loadArticleData();
      });
    }
  }, [accessToken, articleId]);

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
            const mediaBlock: ArticleBlock = {
              id: Date.now().toString(),
              type: "media",
              data: {
                filename: media.filename,
                filepath: media.filepath,
                url: media.filepath,
                caption: media.altText || "",
              },
            };
            const currentBlocks = (editorData?.blocks as ArticleBlock[]) || [];
            setEditorData({ blocks: [...currentBlocks, mediaBlock] });
          },
        },
      }),
    );
  };

  const handleSliderSelect = () => {
    if (sliders.length === 0) {
      showToast("Create sliders first", "error");
      return;
    }

    const sliderHtml = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Select a slider</h3>
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
            <button onclick="closeSliderModalEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
          </div>
        </div>
      </div>`;

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = sliderHtml;
    document.body.appendChild(modalDiv);

    (window as any).selectSliderEdit = (slider: SliderDto) => {
      const sliderBlock: ArticleBlock = {
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
      const currentBlocks = (editorData?.blocks as ArticleBlock[]) || [];
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
      showToast("First, create widgets (except for Header and Footer)", "error");
      return;
    }

    const widgetHtml = `
      <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Select a widget</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${widgets
              .map(
                (w) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer;"
                   onclick="selectWidgetEdit(${JSON.stringify(w).replace(/"/g, "&quot;")})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${w.name}</h4>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Slug: /${w.slug}</p>
              </div>`,
              )
              .join("")}
          </div>
          <div style="margin-top: 20px; text-align: right;">
            <button onclick="closeWidgetModalEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
          </div>
        </div>
      </div>`;

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = widgetHtml;
    document.body.appendChild(modalDiv);

    (window as any).selectWidgetEdit = (w: any) => {
      const widgetBlock: ArticleBlock = {
        id: Date.now().toString(),
        type: "widget",
        data: {
          slug: w.slug,
          name: w.name,
        },
      };
      const currentBlocks = (editorData?.blocks as ArticleBlock[]) || [];
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
      showToast("Fill in the title or content to preview", "error");
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
    if (!accessToken || !articleId) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast("Title and slug are required", "error");
      return;
    }
    setIsSaving(true);

    try {
      const blocks = (editorData?.blocks as ArticleBlock[]) || [];
      await updateArticle(accessToken, parseInt(articleId, 10), {
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
        content: blocks.length ? serializeArticleBlocks(blocks) : "",
      });
      showToast("Article saved", "success");
      router.push("/admin/articles");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Error saving", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
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
            onClick={() => router.push("/admin/articles")}
            className={styles.backButton}
          >
            ← Back to articles
          </button>
          <h1>Edit Article</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Preview
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push("/admin/articles")}>
            Cancel
          </UiButton>
          <UiButton theme="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
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
              placeholder="Article Title"
            />

            <div className={styles.editorWrapper}>
              <DescriptionFieldWrapper
                value={
                  editorData?.blocks ? blocksToMarkdown(editorData.blocks as ArticleBlock[]) : ""
                }
                onChange={(markdown) => {
                  setEditorData({
                    blocks: markdownToBlocks(
                      markdown,
                      (editorData?.blocks as ArticleBlock[]) || [],
                    ),
                  });
                }}
                placeholder="Start writing your article content here..."
                id="article-content"
                label="Article Content"
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
              <label className={styles.label}>Status</label>
              <select
                className={styles.select}
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Template</label>
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
                Enable Feedback
              </label>
            </div>

            {/* Select paymentMethodId */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Payment Method (link)</label>
              <select
                className={styles.select}
                value={form.paymentMethodId || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentMethodId: e.target.value ? parseInt(e.target.value, 10) : null }))}
              >
                <option value="">No payment method</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO Title</label>
              <Input
                value={form.seoTitle}
                onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO Description</label>
              <textarea
                className={styles.textarea}
                value={form.seoDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Keywords (comma-separated)</label>
              <Input
                value={form.metaKeywords}
                onChange={(e) => setForm((prev) => ({ ...prev, metaKeywords: e.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Categories</label>
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
              <label className={styles.label}>Featured Slider</label>
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
                <option value="">No slider</option>
                {sliders.map((slider) => (
                  <option key={slider.id} value={slider.id.toString()}>
                    {slider.name}
                  </option>
                ))}
              </select>

              {selectedSlider?.slides && selectedSlider.slides.length > 0 && (
                <div className={styles.sliderPreview}>
                  <h4>Slider: {selectedSlider.name}</h4>
                  <PageSlider slider={selectedSlider as any} autoPlay showArrows showDots />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ArticlePreviewModal
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

export default EditArticlePage;
