"use client";

import Link from "next/link";
import { ArticleDto } from "@/src/shared/api/articles";
import { PageSlider } from "@/src/shared/ui";
import { getMediaUrl } from "@/src/shared/lib/media-url";
import { ArticleContentView } from "@/src/widgets/article-content/ArticleContentView";
import { CommentsSection } from "@/src/widgets/comments/CommentsSection";
import { PaymentCheckoutCard } from "@/src/widgets/payment-checkout/PaymentCheckoutCard";
import styles from "./PublicArticleView.module.css";

interface PublicArticleViewProps {
  article: ArticleDto;
  showMeta?: boolean;
}

export const PublicArticleView = ({ article, showMeta = false }: PublicArticleViewProps) => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{article.title}</h1>
        {showMeta && article.publishedAt && (
          <p className={styles.meta}>
            Publishedо: {new Date(article.publishedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </header>

      {article.featuredSlider && (
        <section className={styles.featured}>
          <PageSlider
            slider={article.featuredSlider}
            autoPlay
            interval={5000}
            showArrows
            showDots
          />
        </section>
      )}

      {!article.featuredSlider && article.featuredImage && (
        <section className={styles.featured}>
          <img
            src={getMediaUrl(article.featuredImage.filepath)}
            alt={article.featuredImage.filename}
            className={styles.featuredImage}
          />
        </section>
      )}

      <section className={styles.content}>
        <ArticleContentView article={article} publicMode />
      </section>

      {article.paymentMethodId && (
        <PaymentCheckoutCard title={article.title} paymentMethodId={article.paymentMethodId} />
      )}

      {article.categories && article.categories.length > 0 && (
        <section className={styles.categories}>
          <h3>Categories:</h3>
          <div className={styles.categoryTags}>
            {article.categories.map((cat: any) => (
              <span key={cat.id} className={styles.categoryTag}>
                {cat.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <CommentsSection articleId={article.id} />

      {(article.seoTitle || article.seoDescription) && showMeta && (
        <footer className={styles.seo}>
          {article.seoTitle && (
            <p>
              <strong>SEO:</strong> {article.seoTitle}
            </p>
          )}
          {article.seoDescription && <p>{article.seoDescription}</p>}
        </footer>
      )}
    </article>
  );
};

export const PublicArticleLoading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Загрузка статьи...</p>
    </div>
  );
};

export const PublicArticleNotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <p>Статья не найдена или ещё не опубликована.</p>
      <Link href="/">На главную</Link>
    </div>
  );
};
