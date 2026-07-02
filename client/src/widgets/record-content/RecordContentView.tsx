"use client";

import { RecordDto } from "@/src/shared/api/records";
import { blocksFromRecord } from "@/src/shared/lib/record-content";
import { ContentRenderer } from "@/src/widgets/content-renderer/ContentRenderer";
import styles from "./RecordContentView.module.css";

interface RecordContentViewProps {
  record: RecordDto;
  publicMode?: boolean;
}

export const RecordContentView = ({ record, publicMode = true }: RecordContentViewProps) => {
  const blocks = blocksFromRecord(record);

  if (!blocks.length) {
    return null;
  }

  return (
    <div className={styles.root}>
      <ContentRenderer blocks={blocks} publicMode={publicMode} />
    </div>
  );
};
