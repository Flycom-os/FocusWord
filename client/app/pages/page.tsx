'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPublicPages, PageDto } from '@/src/shared/api/pages';
import { Body, Header, Footer, Notifications, showToast } from '@/src/shared/ui';

const PublicPagesList = () => {
  const [pages, setPages] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPages = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPublicPages({});
        setPages(data);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Не удалось загрузить страницы';
        showToast(message, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadPages();
  }, []);

  return (
    <div className="app light">
      <Notifications />
      <Header />
      <Body>
        <h1>Страницы</h1>
        {isLoading && <p>Загрузка...</p>}
        {!isLoading && pages.length === 0 && <p>Нет доступных страниц.</p>}
        {!isLoading && pages.length > 0 && (
          <ul>
            {pages.map((page) => (
              <li key={page.id}>
                <Link href={`/pages/${page.slug}`}>{page.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </Body>
      <Footer />
    </div>
  );
};

export default PublicPagesList;
