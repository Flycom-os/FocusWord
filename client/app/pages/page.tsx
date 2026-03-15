'use client';

import { Body, Header, Footer } from "@/src/shared/ui";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/src/app/providers/auth-provider";
import { useEffect, useState } from "react";
import { fetchPages, PageDto } from '@/src/shared/api/pages';
import { Calendar, FileText, Eye } from 'lucide-react';

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
      <div className="app light">
        <Header />
        <Body>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Загрузка страниц...</p>
          </div>
        </Body>
        <Footer />
      </div>
    );
  }

  return (
    <div className="app light">
      <Header />
      <Body>
        <h1>Наши страницы</h1>
        <p>
          Здесь собраны все опубликованные страницы нашего сайта. Вы можете найти статьи, лендинги и другой контент.
        </p>
        
        <h2>Доступные страницы</h2>
        {pages.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Страницы не найдены</h3>
              <p className="text-gray-600">На данный момент нет опубликованных страниц</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <Link 
                  href={`/pages/${page.slug}`}
                  className="block"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-purple-600 transition-colors">
                        {page.title}
                      </h3>
                      
                      {page.content && (
                        <p className="text-gray-600 text-sm mb-3">
                          {page.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{new Date(page.createdAt).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-600">
                          <Eye size={14} />
                          <span>Читать</span>
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {page.status === 'published' ? 'Опубликовано' : page.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        <h2>Специальные страницы</h2>
        <ul>
          <li>
            <a href="/pages/incidents" className="text-purple-600 hover:underline">
              <b>Инциденты</b> — страница мониторинга сбоев и проблем в работе системы
            </a>
          </li>
        </ul>

        <h2>Как создавать страницы</h2>
        <ol>
          <li>Зайдите в админку `/admin/pages` (нужны права pages:2).</li>
          <li>Создайте страницу, заполните заголовок, slug и контент.</li>
          <li>Переведите статус в `published`, чтобы она стала доступна по публичному URL `/pages/[slug]`.</li>
        </ol>
        <p>Этот раздел можно расширять: добавлять новые страницы и контент.</p>
      </Body>
      <Footer />
    </div>
  );
};

export default PagesListPage;
