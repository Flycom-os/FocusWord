"use client";

import { ArticleDto } from "@/src/shared/api/articles";
import { blocksFromArticle } from "@/src/shared/lib/article-content";
import { ContentRenderer } from "@/src/widgets/content-renderer/ContentRenderer";
import styles from "./ArticleContentView.module.css";

interface ArticleContentViewProps {
  article: ArticleDto;
  publicMode?: boolean;
}

export const ArticleContentView = ({ article, publicMode = true }: ArticleContentViewProps) => {
  const blocks = blocksFromArticle(article);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={styles.root}>
      <ContentRenderer blocks={blocks} publicMode={publicMode} />
    </div>
  );
};
