"use client";

import { OutputData } from "@editorjs/editorjs";
import { BlogPostDto } from "@/src/shared/api/blog";
import { SliderDetailsDto } from "@/src/shared/api/sliders";
import { serializeBlogPostBlocks, type BlogPostBlock } from "@/src/shared/lib/blogPost-content";
import { PublicBlogPostView } from "@/src/widgets/public-blogPost/PublicBlogPostView";
import { UiButton } from "@/src/shared/ui";
import styles from "./BlogPostPreviewModal.module.css";

interface BlogPostPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  slug: string;
  editorData?: OutputData;
  featuredSlider?: SliderDetailsDto | null;
}

export const BlogPostPreviewModal = ({
  open,
  onClose,
  title,
  slug,
  editorData,
  featuredSlider,
}: BlogPostPreviewModalProps) => {
  if (!open) {
    return null;
  }

  const previewBlogPost: BlogPostDto = {
    id: 0,
    title: title || "Untitled",
    slug: slug || "preview",
    content: editorData?.blocks?.length
      ? serializeBlogPostBlocks(editorData.blocks as BlogPostBlock[])
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
            <h3>Preview</h3>
            <p>/{slug || "slug"}</p>
          </div>
          <UiButton theme="secondary" onClick={onClose}>
            Close
          </UiButton>
        </div>
        <div className={styles.body}>
          <PublicBlogPostView blogPost={previewBlogPost} />
        </div>
      </div>
    </div>
  );
};
