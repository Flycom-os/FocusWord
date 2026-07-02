"use client";

import { useEffect, useState } from "react";
import { fetchPublicRecordBySlug, RecordDto } from "@/src/shared/api/records";
import {
  PublicRecordLoading,
  PublicRecordNotFound,
  PublicRecordView,
} from "@/src/widgets/public-record/PublicRecordView";
import { FeedbackForm } from "@/src/widgets/feedback-form/FeedbackForm";

export default function PublicSlugRecord({ params }: { params: { slug: string } }) {
  const [record, setRecord] = useState<RecordDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await fetchPublicRecordBySlug(params.slug);
        if (!cancelled) {
          setRecord(data);
        }
      } catch {
        if (!cancelled) {
          setRecord(null);
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
    return <PublicRecordLoading />;
  }

  if (notFound || !record || record.status !== "published") {
    return <PublicRecordNotFound />;
  }

  return (
    <>
      <PublicRecordView record={record} />
      <FeedbackForm />
    </>
  );
}
