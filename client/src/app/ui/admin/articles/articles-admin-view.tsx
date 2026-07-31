"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  completeArticleWithAi,
  createArticle,
  deleteArticle,
  fetchArticles,
  ArticleDto,
  ArticlesQuery,
  updateArticle,
} from "@/src/shared/api/articles";
import {
  Modal,
  Notifications,
  Pagination,
  PermissionGate,
  PageSlider,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  UiButton,
  showToast,
  SelectableTableRow,
  SelectableTableHead,
} from "@/src/shared/ui";
import { useTableSelection } from "@/src/shared/hooks/useTableSelection";
import Input from "@/src/shared/ui/Input/ui-input";
import { useDebounce } from "@/src/shared/hooks/use-debounce";
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from "@/src/shared/api/sliders";
import { OutputData } from "@editorjs/editorjs";
import { editorToolsToHtml } from "@/src/shared/lib/editor-tools-to-html";
import { MediaPickerModal } from "@/src/features/Media/ui/MediaPickerModal";
import styles from "./articles-admin-view.module.css";

const Editor = dynamic(() => import("@/src/features/Editor/ui/Editor"), { ssr: false });

const defaultQuery: ArticlesQuery = { page: 1, limit: 20 };

type EditorForm = {
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  featuredSliderId?: number | null;
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
};

const ArticlesArticle = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<ArticlesQuery>(defaultQuery);
  const [search, setSearch] = useState("");
  const [articles, setArticles] = useState<ArticleDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Table selection hook
  const tableSelection = useTableSelection({
    items: articles,
    getItemId: (article) => article.id,
    onSelectionChange: (selectedIds) => {
      console.log("Selected articlesd:", selectedIds);
    },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleDto | null>(null);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>();

  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewSlider, setPreviewSlider] = useState<SliderDetailsDto | null>(null);
  const [isLoadingPreviewSlider, setIsLoadingPreviewSlider] = useState(false);

  // Sliders
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isLoadingSliders, setIsLoadingSliders] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{
    onSelect: (media: any) => void;
  } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // A bit of a hack to make the access token available to the vanilla JS Editor.js tools
  if (typeof window !== "undefined") {
    (window as any).accessToken = accessToken;
  }

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

  const totalArticles = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil((articles.length || 1) / query.limit));
  }, [articles.length, query.limit]);

  const loadArticles = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchArticles(accessToken, {
        ...query,
        search: debouncedSearch || undefined,
      });
      setArticles(data);
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to load articles", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSliders = async () => {
    if (!accessToken) return;
    setIsLoadingSliders(true);
    try {
      const data = await fetchSliders(accessToken, { page: 1, limit: 100 });
      setSliders(data.data);
    } catch (error: any) {
      console.error("Error loading sliders:", error);
    } finally {
      setIsLoadingSliders(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, [accessToken, query.page, query.limit, debouncedSearch]);

  useEffect(() => {
    if (isModalOpen) {
      loadSliders();
    }
  }, [isModalOpen, accessToken]);

  const handleCreateArticle = () => {
    window.location.href = "/admin/articles/create";
  };

  const handleEditArticle = (article: ArticleDto) => {
    window.location.href = `/admin/articles/create/${article.id}`;
  };

  const handleAiAssist = async () => {
    if (!accessToken) return;
    const prompt = window.prompt(
      'What would you like to do with the text? For example: "make it shorter and more structured"',
    );
    if (!prompt?.trim() || !editorData) return;
    setIsAiLoading(true);
    try {
      // For AI assistant, we can convert current blocks to a simple text representation
      const content = editorData.blocks
        .map((block) => block.data.text || "")
        .filter(Boolean)
        .join("\n");
      const result = await completeArticleWithAi(accessToken, { prompt: prompt.trim(), content });

      // The result is simple text, so we replace the editor content with a single paragraph block
      setEditorData({
        blocks: [{ type: "paragraph", data: { text: result.text } }],
      });

      showToast("AI updated the text", "success");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "AI is unavailable", "error");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePreview = async () => {
    const html = editorData ? editorToolsToHtml(editorData.blocks) : "";
    setPreviewHtml(html);
    setPreviewSlider(null);

    if (form.featuredSliderId) {
      if (!accessToken) {
        showToast("Access token is missing for slider preview", "error");
        return;
      }
      setIsLoadingPreviewSlider(true);
      try {
        const slider = await getSlider(accessToken, form.featuredSliderId);
        setPreviewSlider(slider);
      } catch (error: any) {
        showToast(
          error?.response?.data?.message || "Failed to load slider for preview",
          "error",
        );
      } finally {
        setIsLoadingPreviewSlider(false);
      }
    }

    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast("Name and slug are required", "error");
      return;
    }
    setIsSaving(true);

    try {
      const articleData = {
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
        contentBlocks: editorData
          ? editorData.blocks.map((block) => ({
              type: block.type as any,
              id: Date.now() + Math.random(),
              config: block.data,
            }))
          : [],
        content: editorData ? editorToolsToHtml(editorData.blocks) : "", // for legacy support
      };

      if (editingArticle) {
        const updated = await updateArticle(accessToken, editingArticle.id, articleData);
        setArticles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast("Article updated", "success");
      } else {
        const created = await createArticle(accessToken, articleData);
        setArticles((prev) => [created, ...prev]);
        showToast("Article created", "success");
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to save", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteArticle(accessToken, id);
      setArticles((prev) => prev.filter((item) => item.id !== id));
      showToast("Article deleted", "success");
    } catch (error: any) {
      showToast(error?.response?.data?.message || "Failed to delete article", "error");
    }
  };

  return (
    <div className={styles.root}>
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
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          theme="secondary"
          icon="left"
          placeholder="Search articles..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <PermissionGate resource="articles" level={2}>
          <UiButton theme="primary" onClick={handleCreateArticle}>
            Create Article
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table} ref={tableSelection.tableRef}>
        <TableHeader>
          <TableRow>
            <SelectableTableHead
              selectable
              onSelectAll={tableSelection.selectAll}
              isAllSelected={tableSelection.isAllSelected()}
              isPartiallySelected={tableSelection.isPartiallySelected()}
            />
            <TableHead> Name </TableHead>
            <TableHead>Slug</TableHead>
            <TableHead> Status </TableHead>
            <TableHead> Actions </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5}> Loading... </TableCell>
            </TableRow>
          ) : articles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>Articles not found</TableCell>
            </TableRow>
          ) : (
            articles.map((article, index) => (
              <SelectableTableRow
                key={article.id}
                selected={tableSelection.isSelected(article.id)}
                focused={tableSelection.focusedIndex === index}
                onSelect={(e) => tableSelection.handleRowClick(article.id, e)}
                checkboxColumn
              >
                <TableCell>{article.title}</TableCell>
                <TableCell>{article.slug}</TableCell>
                <TableCell>
                  {article.status === "published" ? "Published" : "Draft"}
                </TableCell>
                <TableCell className={styles.actions}>
                  <UiButton theme="secondary" onClick={() => handleEditArticle(article)}> Edit </UiButton>
                  <PermissionGate resource="articles" level={2}>
                    <UiButton theme="warning" onClick={() => handleDelete(article.id)}> Delete </UiButton>
                  </PermissionGate>
                </TableCell>
              </SelectableTableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className={styles.pagination}>
        <Pagination
          page={query.page || 1}
          total={articles.length}
          perPage={query.limit || 20}
          onChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        />
      </div>

      <PermissionGate resource="articles" level={2}>
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingArticle ? "Edit Article" : "Create Article"}
        >
          <div className={styles.modalContent}>
            <div className={styles.grid}>
              <div className={styles.mainCol}>
                <Input
                  className={styles.input}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Name"
                />
                <div className={styles.editorWrapper}>
                  <Editor holder="editorjs-container" data={editorData} onChange={setEditorData} />
                  <div className={styles.editorAitoolbar}>
                    <UiButton theme="secondary" onClick={handleAiAssist}>
                      {isAiLoading ? "AI..." : "✨ AI"}
                    </UiButton>
                  </div>
                </div>
              </div>

              <div className={styles.sideCol}>
                <label className={styles.label}>Slug</label>
                <Input
                  value={form.slug}
                  onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
                />

                <label className={styles.label}> Status </label>
                <Select
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "published", label: "Published" },
                  ]}
                  value={form.status}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value as string }))}
                />

                <label className={styles.label}>Template</label>
                <Input
                  value={form.template}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, template: event.target.value }))
                  }
                />

                <label className={styles.label}>SEO Title</label>
                <Input
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seoTitle: event.target.value }))
                  }
                />

                <label className={styles.label}>SEO Description</label>
                <textarea
                  className={styles.textarea}
                  value={form.seoDescription}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, seoDescription: event.target.value }))
                  }
                />

                <label className={styles.label}>Meta Keywords (comma-separated)</label>
                <Input
                  value={form.metaKeywords}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))
                  }
                />

                <label className={styles.label}>Featured Slider</label>
                <Select
                  options={[
                    { value: "", label: "No Slider" },
                    ...sliders.map((slider) => ({
                      value: slider.id.toString(),
                      label: slider.name,
                    })),
                  ]}
                  value={form.featuredSliderId?.toString() || ""}
                  onChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      featuredSliderId: value ? parseInt(value as string) : null,
                    }))
                  }
                  disabled={isLoadingSliders}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <UiButton theme="secondary" onClick={() => setIsModalOpen(false)}> Cancel </UiButton>
              <UiButton theme="secondary" onClick={handlePreview}> Preview </UiButton>
              <UiButton theme="primary" onClick={handleSave}>
                {isSaving ? "Saving..." : "Save"}
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>

      <Modal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Article Preview"
      >
        <div className={styles.previewModalContent}>
          <div className={styles.previewHeader}>
            <h2>{form.title || "Article Preview"}</h2>
            <p className={styles.previewSubtitle}>
              Status: {form.status === "published" ? "Published" : "Draft"} · Template:{" "}
              {form.template}
            </p>
          </div>

          {isLoadingPreviewSlider ? (
            <div className={styles.previewLoader}>Loading slider...</div>
          ) : previewSlider ? (
            <div className={styles.previewSliderWrapper}>
              <PageSlider slider={previewSlider as any} autoPlay={false} showArrows showDots />
            </div>
          ) : form.featuredSliderId ? (
            <div className={styles.previewEmpty}>
              Failed to load slider for preview.
            </div>
          ) : null}

          <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: previewHtml }} />

          <div className={styles.modalActions}>
            <UiButton theme="secondary" onClick={() => setIsPreviewOpen(false)}> Close </UiButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ArticlesArticle;
