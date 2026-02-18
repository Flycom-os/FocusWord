'use client';

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/src/app/providers/auth-provider";
import { fetchPages, PageDto, PagesQuery } from "@/src/shared/api/pages";
import { Body, Header, Footer, Notifications, Pagination, UiButton, showToast } from "@/src/shared/ui";
import Input from "@/src/shared/ui/Input/ui-input";
import styles from "@/src/pages/settings/index.module.css";

const defaultQuery: PagesQuery = {
  page: 1,
  limit: 10,
  status: "published",
};

const MyPages = () => {
  const { user, accessToken } = useAuth();
  const [query, setQuery] = useState<PagesQuery>(defaultQuery);
  const [pages, setPages] = useState<PageDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil(total / query.limit));
  }, [total, query.limit]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetchPages(accessToken, { ...query, authorId: user.id });
        setPages(res.data);
        setTotal(res.total);
      } catch (error: any) {
        const message = error?.response?.data?.message || "Не удалось загрузить страницы";
        showToast({ type: "error", message });
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user, accessToken, query]);

  const handleSearchChange = (value: string) => {
    setQuery((prev) => ({ ...prev, page: 1, search: value }));
  };

  const handlePageChange = (page: number) => {
    setQuery((prev) => ({ ...prev, page }));
  };

  return (
    <div className="app light">
      <Notifications />
      <Header />
      <Body>
        <h1>Мои страницы</h1>
        <div className={styles.toolbar}>
          <Input
            className={styles.input}
            theme="secondary"
            icon="left"
            placeholder="Поиск по заголовку"
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <div>
          {isLoading && <p>Загрузка...</p>}
          {!isLoading &&
            pages.map((page) => (
              <div key={page.id} className={styles.row}>
                <div>{page.title}</div>
                <div>
                  <UiButton theme="third" onClick={() => (window.location.href = `/pages/${page.slug}`)}>
                    Открыть
                  </UiButton>
                </div>
              </div>
            ))}
          {!isLoading && !pages.length && <p>У вас пока нет страниц.</p>}
        </div>
        <Pagination currentPage={query.page || 1} totalPages={totalPages} onPageChange={handlePageChange} />
      </Body>
      <Footer />
    </div>
  );
};

export default MyPages;


