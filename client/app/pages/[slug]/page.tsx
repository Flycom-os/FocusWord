'use client';

import { useEffect, useState } from 'react';
import { fetchPageBySlug, PageDto } from '@/src/shared/api/pages';
import { useAuth } from '@/src/app/providers/auth-provider';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка страницы...</p>
        </div>
      </div>
    );
  }

  if (!page || page.status !== 'published') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Навигация */}
        <div className="mb-8">
          <Link 
            href="/pages"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors"
          >
            <ChevronLeft size={20} />
            <span>Назад к страницам</span>
          </Link>
        </div>

        {/* Заголовок страницы */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{page.title}</h1>
            
            {/* Изображение если есть */}
            {page.featuredImage && (
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
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
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
        </div>

        {/* Контент страницы */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />
          </div>
        </div>

        {/* SEO информация если есть */}
        {(page.seoTitle || page.seoDescription) && (
          <div className="mt-8 p-4 bg-purple-50 rounded-lg">
            <h3 className="text-sm font-semibold text-purple-800 mb-2">SEO информация:</h3>
            {page.seoTitle && (
              <p className="text-sm text-purple-700 mb-1">
                <strong>Заголовок:</strong> {page.seoTitle}
              </p>
            )}
            {page.seoDescription && (
              <p className="text-sm text-purple-700">
                <strong>Описание:</strong> {page.seoDescription}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
