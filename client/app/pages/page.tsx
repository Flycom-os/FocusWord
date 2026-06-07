"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchPublicPages, PublicPageSummary } from "@/src/shared/api/pages";
import { Calendar, FileText, Eye } from "lucide-react";
import styles from "./pages-list.module.css";

const PagesListPage = () => {
  const [pages, setPages] = useState<PublicPageSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        const publicPages = await fetchPublicPages();
        setPages(publicPages);
      } catch (error) {
        console.error("Failed to load public pages", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPages();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.wrap}>
        <p>Загрузка страниц...</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1>Опубликованные страницы</h1>
      <p className={styles.lead}>
        Список страниц сайта. Каждая доступна по адресу <code>/{"{slug}"}</code> без авторизации.
      </p>

      {pages.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={48} />
          <p>Нет опубликованных страниц</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {pages.map((page) => (
            <li key={page.id} className={styles.card}>
              <Link href={`/${page.slug}`} className={styles.cardLink}>
                <h2>{page.title}</h2>
                {page.seoDescription && <p>{page.seoDescription}</p>}
                <div className={styles.meta}>
                  <span>
                    <Calendar size={14} />
                    {page.publishedAt
                      ? new Date(page.publishedAt).toLocaleDateString("ru-RU")
                      : new Date(page.updatedAt).toLocaleDateString("ru-RU")}
                  </span>
                  <span className={styles.read}>
                    <Eye size={14} /> Открыть
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PagesListPage;
