'use client';

import { useEffect, useState } from 'react';
import { fetchPublicPageBySlug, PageDto } from '@/src/shared/api/pages';
import { Body, Header, Footer, PageSlider } from "@/src/shared/ui";
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { ContentRenderer } from '@/src/widgets/content-renderer/ContentRenderer';

const DocumentationPage = () => {
  const [page, setPage] = useState<PageDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      console.log('DocumentationPage: Loading page with slug: documentation');
      
      try {
        const pageData = await fetchPublicPageBySlug('documentation');
        setPage(pageData);
      } catch (error: any) {
        console.error('DocumentationPage: Failed to load page', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPage();
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
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600 mb-8">Документация не найдена</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ChevronLeft size={20} />
              Вернуться на главную
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

        {/* Контент страницы */}
        <div className="prose prose-lg max-w-none">
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
      </Body>
      <Footer />
    </div>
  );
};

export default DocumentationPage;
