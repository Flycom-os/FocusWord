'use client';

import { useEffect, useState } from 'react';
import { fetchPageBySlug, PageDto } from '@/src/shared/api/pages';

const Page = ({ params }: { params: { slug: string } }) => {
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const pageData = await fetchPageBySlug(null, params.slug);
        setPage(pageData);
      } catch (error) {
        console.error('Failed to load page', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      loadPage();
    }
  }, [params.slug]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!page || page.status !== 'published') {
    return (
      <div>
        <h1>404 - Page not found</h1>
      </div>
    )
  }

  return (
    <div>
      <h1>{page.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
};

export default Page;
