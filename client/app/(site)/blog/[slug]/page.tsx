"use client";

import { useEffect, useState } from "react";
import { fetchPublicBlogPostBySlug, BlogPostDto } from "@/src/shared/api/blog";
import {
  PublicBlogPostLoading,
  PublicBlogPostNotFound,
  PublicBlogPostView,
} from "@/src/widgets/public-blogPost/PublicBlogPostView";
import { FeedbackForm } from "@/src/widgets/feedback-form/FeedbackForm";
import { PageTracker } from "@/src/widgets/page-tracker/PageTracker";

export default function PublicSlugBlogPost({ params }: { params: { slug: string } }) {
  const [blogPost, setBlogPost] = useState<BlogPostDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPublicBlogPostBySlug(params.slug);
        if (!cancelled) {
          setBlogPost(data);
        }
      } catch {
        if (!cancelled) {
          setBlogPost(null);
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
    return <PublicBlogPostLoading />;
  }

  if (notFound || !blogPost || blogPost.status !== "published") {
    return <PublicBlogPostNotFound />;
  }

  return (
    <>
      <PageTracker entityType="blogPost" entityId={blogPost.id} />
      <PublicBlogPostView blogPost={blogPost} />
      {blogPost.enableFeedback !== false && <FeedbackForm />}
    </>
  );
}
