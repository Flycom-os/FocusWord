'use client';

import { useEffect, useState } from 'react';
import { fetchPages, PageDto } from '@/src/shared/api/pages';
import Link from 'next/link';

const PagesListPage = () => {
  const [pages, setPages] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const publicPages = await fetchPages(null, { status: 'published' });
        setPages(publicPages);
      } catch (error) {
        console.error('Failed to load pages', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Pages</h1>
      <ul>
        {pages.map((page) => (
          <li key={page.id}>
            <Link href={`/pages/${page.slug}`}>
              {page.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PagesListPage;
