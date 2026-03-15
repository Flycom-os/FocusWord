'use client';

import { useEffect, useState } from 'react';
import { fetchPages, PageDto } from '@/src/shared/api/pages';
import Link from 'next/link';
import { useAuth } from '@/src/app/providers/auth-provider';
import { ChevronRight, Calendar, FileText, Eye } from 'lucide-react';

const PagesListPage = () => {
  const { accessToken } = useAuth();
  const [pages, setPages] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      console.log('Public Pages: Loading published pages');
      console.log('Public Pages: Token available:', !!accessToken);
      
      try {
        const publicPages = await fetchPages(accessToken, { status: 'published' });
        setPages(publicPages);
      } catch (error: any) {
        console.error('Public Pages: Failed to load pages', error);
        if (error?.response?.status === 401) {
          console.log('Public Pages: Token required for pages, showing empty list');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPages();
  }, [accessToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка страниц...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Наши страницы</h1>
          <p className="text-gray-600 text-lg">Исследуйте наши опубликованные страницы</p>
        </div>

        {/* Список страниц */}
        {pages.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Страницы не найдены</h3>
              <p className="text-gray-600">На данный момент нет опубликованных страниц</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link 
                key={page.id}
                href={`/pages/${page.slug}`}
                className="group block"
              >
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
                  {/* Изображение если есть */}
                  {page.featuredImage ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={page.featuredImage.filepath.startsWith('http') 
                          ? page.featuredImage.filepath 
                          : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331"}/uploads/${page.featuredImage.filepath}`
                        } 
                        alt={page.featuredImage.filename}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-purple-400" />
                    </div>
                  )}

                  {/* Контент карточки */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-purple-600 transition-colors">
                      {page.title}
                    </h3>
                    
                    {/* Краткое описание если есть */}
                    {page.content && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {page.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                    )}

                    {/* Мета информация */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(page.createdAt).toLocaleDateString('ru-RU')}</span>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <Eye size={14} />
                        <span>Читать</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Статус */}
                    <div className="mt-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {page.status === 'published' ? 'Опубликовано' : page.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* SEO информация если есть у страниц */}
        {pages.some(page => page.seoTitle || page.seoDescription) && (
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500">
              Все страницы оптимизированы для поисковых систем
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagesListPage;
