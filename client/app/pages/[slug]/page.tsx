'use client';

import { useEffect, useState } from 'react';
import { fetchPageBySlug, PageDto } from '@/src/shared/api/pages';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Body, Header, Footer, PageSlider } from "@/src/shared/ui";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const Page = ({ params }: { params: { slug: string } }) => {
  const { accessToken } = useAuth();
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      console.log('Page: Loading page with slug:', params.slug);
      console.log('Page: Token available:', !!accessToken);
      
      try {
        const pageData = await fetchPageBySlug(accessToken, params.slug);
        setPage(pageData);
      } catch (error: any) {
        console.error('Page: Failed to load page', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      loadPage();
    }
  }, [params.slug, accessToken]);

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
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Страница не найдена</p>
            <Link 
              href="/pages"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ChevronLeft size={20} />
              Вернуться к страницам
            </Link>
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
        {/* Навигация */}
        <div className="mb-6">
          <Link 
            href="/pages"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Назад к страницам</span>
          </Link>
        </div>

        {/* Заголовок страницы */}
        <h1>{page.title}</h1>

        {/* Featured Slider если есть */}
        {page.featuredSlider && (
          <div className="my-8">
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
          <div className="mb-6">
            <img 
              src={page.featuredImage.filepath.startsWith('http') 
                ? page.featuredImage.filepath 
                : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331"}/uploads/${page.featuredImage.filepath}`
              } 
              alt={page.featuredImage.filename}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Мета информация */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Статус: {page.status === 'published' ? 'Опубликовано' : page.status}</span>
            <span>•</span>
            <span>Создано: {new Date(page.createdAt).toLocaleDateString('ru-RU')}</span>
            {page.updatedAt !== page.createdAt && (
              <>
                <span>•</span>
                <span>Обновлено: {new Date(page.updatedAt).toLocaleDateString('ru-RU')}</span>
              </>
            )}
          </div>
        </div>

        {/* Контент страницы */}
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>

        {/* SEO информация если есть */}
        {(page.seoTitle || page.seoDescription) && (
          <div className="mt-8">
            <h2>SEO информация</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              {page.seoTitle && (
                <p className="mb-2">
                  <strong>Заголовок:</strong> {page.seoTitle}
                </p>
              )}
              {page.seoDescription && (
                <p>
                  <strong>Описание:</strong> {page.seoDescription}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Навигация внизу */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link 
            href="/pages"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Вернуться к списку страниц</span>
          </Link>
        </div>
      </Body>
      <Footer />
    </div>
  );
};

export default Page;
