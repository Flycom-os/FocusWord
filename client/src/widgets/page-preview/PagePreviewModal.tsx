"use client";

import { OutputData } from "@editorjs/editorjs";
import { PageDto } from "@/src/shared/api/pages";
import { SliderDetailsDto } from "@/src/shared/api/sliders";
import { serializePageBlocks, type PageBlock } from "@/src/shared/lib/page-content";
import { PublicPageView } from "@/src/widgets/public-page/PublicPageView";
import { UiButton } from "@/src/shared/ui";
import styles from "./PagePreviewModal.module.css";

interface PagePreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  editorData?: OutputData;
  featuredSlider?: SliderDetailsDto | null;
}

export const PagePreviewModal = ({
  open,
  onClose,
  title,
  slug,
  editorData,
  featuredSlider,
}: PagePreviewModalProps) => {
  if (!open) {
    return null;
  }

  const previewPage: PageDto = {
    id: 0,
    title: title || "Без названия",
    slug: slug || "preview",
    content: editorData?.blocks?.length
      ? serializePageBlocks(editorData.blocks as PageBlock[])
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
          <PublicPageView page={previewPage} />
        </div>
      </div>
    </div>
  );
};
