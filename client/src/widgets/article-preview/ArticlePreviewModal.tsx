"use client";

import { OutputData } from "@editorjs/editorjs";
import { ArticleDto } from "@/src/shared/api/articles";
import { SliderDetailsDto } from "@/src/shared/api/sliders";
import { serializeArticleBlocks, type ArticleBlock } from "@/src/shared/lib/article-content";
import { PublicArticleView } from "@/src/widgets/public-article/PublicArticleView";
import { UiButton } from "@/src/shared/ui";
import styles from "./ArticlePreviewModal.module.css";

interface ArticlePreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  editorData?: OutputData;
  featuredSlider?: SliderDetailsDto | null;
}

export const ArticlePreviewModal = ({
  open,
  onClose,
  title,
  slug,
  editorData,
  featuredSlider,
}: ArticlePreviewModalProps) => {
  if (!open) {
    return null;
  }

  const previewArticle: ArticleDto = {
    id: 0,
    title: title || "Без названия",
    slug: slug || "preview",
    content: editorData?.blocks?.length
      ? serializeArticleBlocks(editorData.blocks as ArticleBlock[])
      : "",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    featuredSlider: featuredSlider
      ? {
          id: featuredSlider.id,
          name: featuredSlider.name,
          slug: featuredSlider.slug,
          description: featuredSlider.description ?? undefined,
          slides: featuredSlider.slides?.map((slide) => ({
            id: slide.id,
            title: slide.title ?? undefined,
            description: slide.description ?? undefined,
            linkUrl: slide.linkUrl ?? undefined,
            sortOrder: slide.sortOrder,
            image: slide.image ?? null,
          })),
        }
      : null,
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.toolbar}>
          <div>
            <h3>Предпросмотр</h3>
            <p>/{slug || "slug"}</p>
          </div>
          <UiButton theme="secondary" onClick={onClose}>
            Закрыть
          </UiButton>
        </div>
        <div className={styles.body}>
          <PublicArticleView article={previewArticle} />
        </div>
      </div>
    </div>
  );
};
