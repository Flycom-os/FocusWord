"use client";

import { useEffect, useState } from "react";
import { fetchPublicPageBySlug, PageDto } from "@/src/shared/api/pages";
import {
  PublicPageLoading,
  PublicPageNotFound,
  PublicPageView,
} from "@/src/widgets/public-page/PublicPageView";
import { FeedbackForm } from "@/src/widgets/feedback-form/FeedbackForm";
import { PageTracker } from "@/src/widgets/page-tracker/PageTracker";

export default function PublicSlugPage({ params }: { params: { slug: string } }) {
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPublicPageBySlug(params.slug);
        if (!cancelled) {
          setPage(data);
        }
      } catch {
        if (!cancelled) {
          setPage(null);
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
    return <PublicPageLoading />;
  }

  if (notFound || !page || page.status !== "published") {
    return <PublicPageNotFound />;
  }

  return (
    <>
      <PageTracker entityType="page" entityId={page.id} />
      <PublicPageView page={page} />
      {page.enableFeedback !== false && <FeedbackForm />}
    </>
  );
}
