"use client";

import { OutputData } from "@editorjs/editorjs";
import { RecordDto } from "@/src/shared/api/records";
import { SliderDetailsDto } from "@/src/shared/api/sliders";
import { serializeRecordBlocks, type RecordBlock } from "@/src/shared/lib/record-content";
import { PublicRecordView } from "@/src/widgets/public-record/PublicRecordView";
import { UiButton } from "@/src/shared/ui";
import styles from "./RecordPreviewModal.module.css";

interface RecordPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  editorData?: OutputData;
  featuredSlider?: SliderDetailsDto | null;
}

export const RecordPreviewModal = ({
  open,
  onClose,
  title,
  slug,
  editorData,
  featuredSlider,
}: RecordPreviewModalProps) => {
  if (!open) {
    return null;
  }

  const previewRecord: RecordDto = {
    id: 0,
    title: title || "Без названия",
    slug: slug || "preview",
    content: editorData?.blocks?.length
      ? serializeRecordBlocks(editorData.blocks as RecordBlock[])
      : "",
    status: "published",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    template: "default",
    categories: [],
  };

  // Attach featuredSlider details in runtime preview object
  if (featuredSlider) {
    (previewRecord as any).featuredSlider = {
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
    };
  }

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
          <PublicRecordView record={previewRecord} />
        </div>
      </div>
    </div>
  );
};
