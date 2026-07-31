"use client";

import Link from "next/link";
import { BlogPostDto } from "@/src/shared/api/blog";
import { PageSlider } from "@/src/shared/ui";
import { getMediaUrl } from "@/src/shared/lib/media-url";
import { BlogPostContentView } from "@/src/widgets/blogPost-content/BlogPostContentView";
import { CommentsSection } from "@/src/widgets/comments/CommentsSection";
import { PaymentCheckoutCard } from "@/src/widgets/payment-checkout/PaymentCheckoutCard";
import styles from "./PublicBlogPostView.module.css";

interface PublicBlogPostViewProps {
  blogPost: BlogPostDto;
  showMeta?: boolean;
}

export const PublicBlogPostView = ({ blogPost, showMeta = false }: PublicBlogPostViewProps) => {
  return (
    <article className={styles.article}>
      <header className={styles.header}>
        <h1 className={styles.title}>{blogPost.title}</h1>
        {showMeta && blogPost.publishedAt && (
          <p className={styles.meta}>
            Publishedо: {new Date(blogPost.publishedAt).toLocaleDateString("ru-RU")}
          </p>
        )}
      </header>

      {blogPost.featuredSlider && (
        <section className={styles.featured}>
          <PageSlider
            slider={blogPost.featuredSlider}
            autoPlay
            interval={5000}
            showArrows
            showDots
          />
        </section>
      )}

      {!blogPost.featuredSlider && blogPost.featuredImage && (
        <section className={styles.featured}>
          <img
            src={getMediaUrl(blogPost.featuredImage.filepath)}
            alt={blogPost.featuredImage.filename}
            className={styles.featuredImage}
          />
        </section>
      )}

      <section className={styles.content}>
        <BlogPostContentView blogPost={blogPost} publicMode />
      </section>

      {blogPost.paymentMethodId && (
        <PaymentCheckoutCard title={blogPost.title} paymentMethodId={blogPost.paymentMethodId} />
      )}

      {blogPost.categories && blogPost.categories.length > 0 && (
        <section className={styles.categories}>
          <h3>Categories:</h3>
          <div className={styles.categoryTags}>
            {blogPost.categories.map((cat: any) => (
              <span key={cat.id} className={styles.categoryTag}>
                {cat.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <CommentsSection blogPostId={blogPost.id} />

      {(blogPost.seoTitle || blogPost.seoDescription) && showMeta && (
        <footer className={styles.seo}>
          {blogPost.seoTitle && (
            <p>
              <strong>SEO:</strong> {blogPost.seoTitle}
            </p>
          )}
          {blogPost.seoDescription && <p>{blogPost.seoDescription}</p>}
        </footer>
      )}
    </article>
  );
};

export const PublicBlogPostLoading = () => {
  return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Загрузка блога...</p>
    </div>
  );
};

export const PublicBlogPostNotFound = () => {
  return (
    <div className={styles.notFound}>
      <h1>404</h1>
      <p>Запись блога не найдена или ещё не опубликована.</p>
      <Link href="/">На главную</Link>
    </div>
  );
};
