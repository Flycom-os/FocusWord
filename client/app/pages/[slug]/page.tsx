'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPageBySlug, PageDto } from "@/src/shared/api/pages";
import { Body, Header, Footer, Notifications, showToast } from "@/src/shared/ui";

const CmsPageBySlug = () => {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPageBySlug(slug);
        setPage(data);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Страница не найдена";
        showToast({ type: "error", message });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  return (
    <div className="app light">
      <Notifications />
      <Header />
      <Body>
        {isLoading && <p>Загрузка...</p>}
        {!isLoading && !page && <p>Страница не найдена.</p>}
        {!isLoading && page && (
          <>
            <h1>{page.title}</h1>
            {/* content хранится как HTML, поэтому выводим через dangerouslySetInnerHTML */}
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          </>
        )}
      </Body>
      <Footer />
    </div>
  );
};

export default CmsPageBySlug;


