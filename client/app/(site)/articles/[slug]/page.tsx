"use client";

import { useEffect, useState } from "react";
import { fetchPublicArticleBySlug, ArticleDto } from "@/src/shared/api/articles";
import {
  PublicArticleLoading,
  PublicArticleNotFound,
  PublicArticleView,
} from "@/src/widgets/public-article/PublicArticleView";
import { FeedbackForm } from "@/src/widgets/feedback-form/FeedbackForm";
import { PageTracker } from "@/src/widgets/page-tracker/PageTracker";

export default function PublicSlugArticle({ params }: { params: { slug: string } }) {
  const [article, setArticle] = useState<ArticleDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPublicArticleBySlug(params.slug);
        if (!cancelled) {
          setArticle(data);
        }
      } catch {
        if (!cancelled) {
          setArticle(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    if (params.slug) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [params.slug]);

  if (isLoading) {
    return <PublicArticleLoading />;
  }

  if (notFound || !article || article.status !== "published") {
    return <PublicArticleNotFound />;
  }

  return (
    <>
      <PageTracker entityType="article" entityId={article.id} />
      <PublicArticleView article={article} />
      {article.enableFeedback !== false && <FeedbackForm />}
    </>
  );
}
