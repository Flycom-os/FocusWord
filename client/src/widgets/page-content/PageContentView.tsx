"use client";

import { PageDto } from "@/src/shared/api/pages";
import { blocksFromPage } from "@/src/shared/lib/page-content";
import { ContentRenderer } from "@/src/widgets/content-renderer/ContentRenderer";
import styles from "./PageContentView.module.css";

interface PageContentViewProps {
  page: PageDto;
  publicMode?: boolean;
}

export const PageContentView = ({ page, publicMode = true }: PageContentViewProps) => {
  const blocks = blocksFromPage(page);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={styles.root}>
      <ContentRenderer blocks={blocks} publicMode={publicMode} />
    </div>
  );
};
