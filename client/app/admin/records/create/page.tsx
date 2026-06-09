"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/app/providers/auth-provider";
import { createRecord, fetchCategories, CategoryDto } from "@/src/shared/api/records";
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from "@/src/shared/api/sliders";
import { RecordPreviewModal } from "@/src/widgets/record-preview/RecordPreviewModal";
import { PageSlider, Notifications, UiButton, showToast } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import { OutputData } from "@editorjs/editorjs";
import {
  blocksToMarkdown,
  markdownToBlocks,
  serializeRecordBlocks,
  type RecordBlock,
} from "@/src/shared/lib/record-content";
import { MediaPickerModal } from "@/src/features/Media/ui/MediaPickerModal";
import styles from "./create.module.css";
import DescriptionFieldWrapper from "./DescriptionFieldWrapper";
import AiGeneratorButton from "../../components/AiGenerator/AiGeneratorButton";

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

const recordSystemPrompt = `You are an expert copywriter. Your task is to generate a well-structured and engaging record content based on the user's prompt. The output should be in Markdown format.

Follow these rules:
1.  Start with a compelling headline (H1).
2.  Write an introduction that grabs the reader's attention.
3.  Use subheadings (H2, H3) to structure the content.
4.  Use lists (ordered or unordered) to present information clearly.
5.  Use bold and italic for emphasis.
6.  End with a concluding paragraph that summarizes the key points.
7.  Do not include any other text or explanations, only the Markdown record content.`;

const seoSystemPrompt = `You are an expert SEO copywriter. Your task is to generate a concise and compelling meta description for a web page based on the user's prompt. The output should be a single paragraph of text, between 140 and 160 characters. Do not use any Markdown or other formatting.`;

export default function CreateRecordPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>({ blocks: [] });
  const [isSaving, setIsSaving] = useState(false);
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
    loadSliders().then(() => loadCategories());
  }, [accessToken]);

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

            const currentBlocks = editorData?.blocks || [];
            const newBlocks = [...currentBlocks, mediaBlock];
            setEditorData({ blocks: newBlocks });
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
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Select a slider</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sliders
              .map(
                (slider) => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s;" 
                   onmouseover="this.style.background='#f9fafb'" 
                   onmouseout="this.style.background='white'"
                   onclick="selectSlider(${JSON.stringify(slider).replace(/"/g, "&quot;")})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${slider.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Slug: /${slider.slug}</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">${slider.description || "No description"}</p>
              </div>`,
              )
              .join("")}
          </div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="closeSliderModal()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Cancel</button>
          </div>
        </div>
      </div>`;

    const modalDiv = document.createElement("div");
    modalDiv.innerHTML = sliderHtml;
    document.body.appendChild(modalDiv);

    (window as any).selectSlider = (slider: any) => {
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

      const currentBlocks = editorData?.blocks || [];
      const newBlocks = [...currentBlocks, sliderBlock];
      setEditorData({ blocks: newBlocks });
      (window as any).closeSliderModal();
    };

    (window as any).closeSliderModal = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectSlider;
      delete (window as any).closeSliderModal;
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
    if (!accessToken) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast("Title and slug are required", "error");
      return;
    }
    setIsSaving(true);

    try {
      const blocks = editorData?.blocks || [];
      const recordData = {
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
        content: blocks.length ? serializeRecordBlocks(blocks as RecordBlock[]) : "",
      };

      await createRecord(accessToken, recordData);
      showToast("Record created", "success");
      router.push("/admin/records");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Error saving", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <Notifications />
      <MediaPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaPickerCallback) {
            mediaPickerCallback.onSelect(media);
          }
          setIsMediaPickerOpen(false);
        }}
        zIndex={2001}
      />

      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push("/admin/records")} className={styles.backButton}>
            ← Back to records
          </button>
          <h1>Create Record</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Preview
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push("/admin/records")}>
            Cancel
          </UiButton>
          <UiButton theme="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Create"}
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
              placeholder="Record title"
            />

            <div className={styles.editorWrapper}>
              <div style={{ marginBottom: '10px' }}>
                <AiGeneratorButton
                  systemPrompt={recordSystemPrompt}
                  onGenerated={(content) => {
                    setEditorData({
                      blocks: markdownToBlocks(
                        content,
                        (editorData?.blocks as RecordBlock[]) || [],
                      ),
                    });
                  }}
                />
              </div>
              <DescriptionFieldWrapper
                value={
                  editorData?.blocks ? blocksToMarkdown(editorData.blocks as RecordBlock[]) : ""
                }
                onChange={(markdown) => {
                  setEditorData({
                    blocks: markdownToBlocks(markdown, (editorData?.blocks as RecordBlock[]) || []),
                  });
                }}
                placeholder="Start writing the record content here..."
                id="record-content"
                label="Record Content"
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
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="url-slug"
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
                onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO Title</label>
              <Input
                value={form.seoTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO Description</label>
              <div style={{ marginBottom: '10px' }}>
                <AiGeneratorButton
                  systemPrompt={seoSystemPrompt}
                  onGenerated={(content) => {
                    setForm((prev) => ({ ...prev, seoDescription: content }))
                  }}
                />
              </div>
              <textarea
                className={styles.textarea}
                value={form.seoDescription}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                }
                placeholder="SEO Description"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Keywords (comma-separated)</label>
              <Input
                value={form.metaKeywords}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))
                }
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
                    featuredSliderId: e.target.value ? parseInt(e.target.value) : null,
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
