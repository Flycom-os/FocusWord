'use client';

import { useEffect, useState } from 'react';
import { fetchPublicPageBySlug, PageDto } from '@/src/shared/api/pages';
import { Body, Header, Footer, PageSlider } from "@/src/shared/ui";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ContentRenderer } from '@/src/widgets/content-renderer/ContentRenderer';

const HomePage = () => {
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState('home'); // Slug по умолчанию для главной

  useEffect(() => {
    const loadPage = async () => {
      console.log('HomePage: Loading page with slug:', slug);
      
      try {
        const pageData = await fetchPublicPageBySlug(slug);
        setPage(pageData);
      } catch (error: any) {
        console.error('HomePage: Failed to load page', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      loadPage();
    }
  }, [slug]);

  // Функция для обновления slug при навигации
  useEffect(() => {
    // Можно получать slug из URL или использовать хеш/параметры
    const pathSlug = window.location.pathname.replace('/', '') || 'home';
    if (pathSlug && pathSlug !== 'admin' && pathSlug !== 'signin' && pathSlug !== 'wiki' && pathSlug !== 'documentation') {
      setSlug(pathSlug);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="app light">
        <Header />
        <Body>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка страницы...</p>
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
          <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Страница не найдена</h2>
                <p className="text-gray-600 mb-8">
                  Извините, но страница, которую вы ищете, не существует или была удалена.
                </p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <ChevronLeft size={20} />
                  <span className="font-medium">Вернуться на главную</span>
                </Link>
                
                <div className="text-sm text-gray-500">
                  Или попробуйте найти то, что вам нужно:
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link 
                    href="/wiki"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Wiki
                  </Link>
                  <Link 
                    href="/documentation"
                    className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
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
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Заголовок страницы */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
          </div>

          {/* Featured Slider если есть */}
          {page.featuredSlider && (
            <div className="mb-12">
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
            <div className="mb-8">
              <img 
                src={page.featuredImage.filepath.startsWith('http') 
                  ? page.featuredImage.filepath 
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331"}/uploads/${page.featuredImage.filepath}`
                } 
                alt={page.featuredImage.filename}
                className="w-full h-96 object-cover rounded-xl shadow-lg"
              />
            </div>
          )}

          {/* Контент страницы */}
          <div className="prose prose-lg max-w-none mb-12">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
            <ContentRenderer blocks={
              page.contentBlocks?.map(block => ({
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
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Информация о странице
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-700">
                <span className="font-medium">Статус:</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  {page.status === 'published' ? 'Опубликовано' : page.status}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="font-medium">Создано:</span>
                <span className="ml-2">{new Date(page.createdAt).toLocaleDateString('ru-RU')}</span>
              </div>
              {page.updatedAt !== page.createdAt && (
                <div className="flex items-center text-gray-700">
                  <span className="font-medium">Обновлено:</span>
                  <span className="ml-2">{new Date(page.updatedAt).toLocaleDateString('ru-RU')}</span>
                </div>
              )}
            </div>
          </div>

          {/* SEO информация - красивый блок */}
          {(page.seoTitle || page.seoDescription) && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                SEO метаданные
              </h3>
              <div className="space-y-3">
                {page.seoTitle && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Заголовок:</span>
                    <p className="mt-1 p-3 bg-white rounded-lg border border-green-200 text-gray-800">
                      {page.seoTitle}
                    </p>
                  </div>
                )}
                {page.seoDescription && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Описание:</span>
                    <p className="mt-1 p-3 bg-white rounded-lg border border-green-200 text-gray-800">
                      {page.seoDescription}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопка возврата */}
          <div className="text-center mt-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <ChevronLeft size={20} />
              <span className="font-medium">Вернуться на главную</span>
            </Link>
          </div>
        </div>
      </Body>
      <Footer />
    </div>
  );
};

export default HomePage;
