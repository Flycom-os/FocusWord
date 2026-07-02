'use client';

import { useEffect, useState } from 'react';
import { fetchPublicPageBySlug, PageDto } from '@/src/shared/api/pages';
import { Body, Header, Footer, PageSlider } from "@/src/shared/ui";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ContentRenderer } from '@/src/widgets/content-renderer/ContentRenderer';
import styles from '@/src/pages/styles/page.module.css';

const Page = ({ query }: { query: { slug: string } }) => {
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      console.log('Page: Loading page with slug:', query.slug);
      
      try {
        const pageData = await fetchPublicPageBySlug(query.slug);
        setPage(pageData);
      } catch (error: any) {
        console.error('Page: Failed to load page', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (query.slug) {
      loadPage();
    }
  }, [query.slug]);

  if (isLoading) {
    return (
      <div className="app light">
        <Header />
        <Body>
          <div className={styles.loadingPage}>
            <div className={styles.loadingSpinner}></div>
            <p>Загрузка страницы...</p>
          </div>
        </Body>
        <Footer />
      </div>
    );
  }

  if (!page || page.status !== 'published') {
    return (
      <div className="app light">
        <Header />
        <Body>
          <div className={styles.errorPage}>
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className={styles.errorTitle}>404</h1>
              <h2 className={styles.errorSubtitle}>Страница не найдена</h2>
              <p className={styles.errorDescription}>
                Извините, но страница, которую вы ищете, не существует или была удалена.
              </p>
              
              <div className={styles.errorActions}>
                <Link 
                  href="/"
                  className={styles.backButton}
                >
                  <ChevronLeft size={20} />
                  <span>Вернуться на главную</span>
                </Link>
                
                <div className={styles.errorSecondaryLinks}>
                  Или попробуйте найти то, что вам нужно:
                </div>
                
                <div className={styles.errorLinks}>
                  <Link 
                    href="/wiki"
                    className={styles.errorLink}
                  >
                    Wiki
                  </Link>
                  <Link 
                    href="/documentation"
                    className={styles.errorLink}
                  >
                    Документация
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Body>
        <Footer />
      </div>
    )
  }

  return (
    <div className="app light">
      <Header />
      <Body>
        <div className={styles.pageContainer}>
          {/* Заголовок страницы */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>{page.title}</h1>
          </div>

          {/* Featured Slider если есть */}
          {page.featuredSlider && (
            <div className={styles.pageSlider}>
              <PageSlider 
                slider={page.featuredSlider}
                autoPlay={true}
                interval={5000}
                showArrows={true}
                showDots={true}
              />
            </div>
          )}
          
          {/* Изображение если есть */}
          {page.featuredImage && !page.featuredSlider && (
            <div className={styles.pageImage}>
              <img 
                src={page.featuredImage.filepath.startsWith('http') 
                  ? page.featuredImage.filepath 
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331"}/uploads/${page.featuredImage.filepath}`
                } 
                alt={page.featuredImage.filename}
              />
            </div>
          )}

          {/* Контент страницы */}
          <div className={styles.pageContent}>
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
            <ContentRenderer blocks={
              page.contentBlocks?.map((block: any) => ({
                id: block.id.toString(),
                type: block.type,
                data: {
                  id: block.id,
                  position: block.position,
                  config: block.config
                }
              })) || []
            } />
          </div>

          {/* Мета информация - красивый блок */}
          <div className={styles.metaInfo}>
            <h3 className={styles.metaInfoTitle}>
              <svg className={styles.metaInfoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Информация о странице
            </h3>
            <div className={styles.metaInfoGrid}>
              <div className={styles.metaInfoItem}>
                <span className={styles.metaInfoLabel}>Статус:</span>
                <span className={`${styles.statusBadge} ${styles.statusBadge[page.status]}`}>
                  {page.status === 'published' ? 'Опубликовано' : page.status}
                </span>
              </div>
              <div className={styles.metaInfoItem}>
                <span className={styles.metaInfoLabel}>Создано:</span>
                <span className={styles.metaInfoValue}>{new Date(page.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              {page.updatedAt !== page.createdAt && (
                <div className={styles.metaInfoItem}>
                  <span className={styles.metaInfoLabel}>Обновлено:</span>
                  <span className={styles.metaInfoValue}>{new Date(page.updatedAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>

          {/* SEO информация - красивый блок */}
          {(page.seoTitle || page.seoDescription) && (
            <div className={styles.seoInfo}>
              <h3 className={styles.seoInfoTitle}>
                <svg className={styles.seoInfoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                SEO метаданные
              </h3>
              <div className={styles.seoInfoContent}>
                {page.seoTitle && (
                  <div className={styles.seoInfoItem}>
                    <span className={styles.seoInfoLabel}>Заголовок:</span>
                    <p className={styles.seoInfoValue}>
                      {page.seoTitle}
                    </p>
                  </div>
                )}
                {page.seoDescription && (
                  <div className={styles.seoInfoItem}>
                    <span className={styles.seoInfoLabel}>Описание:</span>
                    <p className={styles.seoInfoValue}>
                      {page.seoDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопка возврата */}
          <div className={styles.pageNavigation}>
            <Link 
              href="/"
              className={styles.backButton}
            >
              <ChevronLeft size={20} />
              <span>Вернуться на главную</span>
            </Link>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
};

// Для Pages Router нужно получить параметры из query
Page.getInitialProps = async ({ query }: any) => {
  return { query };
};

export default Page;
