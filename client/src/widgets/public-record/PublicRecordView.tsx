"use client";

import Link from "next/link";
import { RecordDto } from "@/src/shared/api/records";
import { PageSlider } from "@/src/shared/ui";
import { getMediaUrl } from "@/src/shared/lib/media-url";
import { RecordContentView } from "@/src/widgets/record-content/RecordContentView";
import styles from "./PublicRecordView.module.css";

interface PublicRecordViewProps {
  record: RecordDto;
  showMeta?: boolean;
}

export const PublicRecordView = ({ record, showMeta = false }: PublicRecordViewProps) => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{record.title}</h1>
        {showMeta && record.createdAt && (
          <p className={styles.meta}>
            Создано: {new Date(record.createdAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </header>

      {record.featuredSliderId && (
        <section className={styles.featured}>
          {/* Note: In record-content or record api, slider details are resolved or passed */}
          {/* For now, checking if featuredSlider payload exists on record */}
          {(record as any).featuredSlider && (
            <PageSlider
              slider={(record as any).featuredSlider}
              autoPlay
              interval={5000}
              showArrows
              showDots
            />
          )}
        </section>
      )}

      {!(record as any).featuredSlider && (record as any).featuredImage && (
        <section className={styles.featured}>
          <img
            src={getMediaUrl((record as any).featuredImage.filepath)}
            alt={(record as any).featuredImage.filename}
            className={styles.featuredImage}
          />
        </section>
      )}

      <section className={styles.content}>
        <RecordContentView record={record} publicMode />
      </section>

      {(record.seoTitle || record.seoDescription) && showMeta && (
        <footer className={styles.seo}>
          {record.seoTitle && (
            <p>
              <strong>SEO:</strong> {record.seoTitle}
            </p>
          )}
          {record.seoDescription && <p>{record.seoDescription}</p>}
        </footer>
      )}
    </article>
  );
};

export const PublicRecordLoading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Загрузка записи...</p>
    </div>
  );
};

export const PublicRecordNotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <p>Запись не найдена или ещё не опубликована.</p>
      <Link href="/">На главную</Link>
    </div>
  );
};
