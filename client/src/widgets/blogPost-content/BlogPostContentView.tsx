"use client";

import { BlogPostDto } from "@/src/shared/api/blog";
import { blocksFromBlogPost } from "@/src/shared/lib/blogPost-content";
import { ContentRenderer } from "@/src/widgets/content-renderer/ContentRenderer";
import styles from "./BlogPostContentView.module.css";

interface BlogPostContentViewProps {
  blogPost: BlogPostDto;
  publicMode?: boolean;
}

export const BlogPostContentView = ({ blogPost, publicMode = true }: BlogPostContentViewProps) => {
  const blocks = blocksFromBlogPost(blogPost);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={styles.root}>
      <ContentRenderer blocks={blocks} publicMode={publicMode} />
    </div>
  );
};
