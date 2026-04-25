'use client';

import Head from 'next/head';
import { seoApi, SEOSettings } from '@/src/shared/api/seo';

interface SEOMetaProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  url?: string;
  type?: 'website' | 'article';
  siteSettings?: SEOSettings;
}

export default function SEOMeta({
  title,
  description,
  keywords,
  ogImage,
  url,
  type = 'website',
  siteSettings
}: SEOMetaProps) {
  // Используем переданные пропсы или настройки сайта по умолчанию
  const pageTitle = title || siteSettings?.siteTitle || 'FocusWord';
  const pageDescription = description || siteSettings?.siteDescription || '';
  const pageKeywords = keywords || siteSettings?.siteKeywords || '';
  const pageOgImage = ogImage || siteSettings?.ogImage || '';
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Head>
      {/* Базовые мета-теги */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="author" content="FocusWord" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph мета-теги */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageOgImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteSettings?.siteTitle || 'FocusWord'} />
      
      {/* Twitter Card мета-теги */}
      <meta name="twitter:card" content={siteSettings?.twitterCard || 'summary_large_image'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageOgImage} />
      
      {/* Favicon */}
      {siteSettings?.favicon && (
        <>
          <link rel="icon" href={siteSettings.favicon} />
          <link rel="apple-touch-icon" href={siteSettings.favicon} />
        </>
      )}
      
      {/* Canonical URL */}
      <link rel="canonical" href={pageUrl} />
      
      {/* Robots */}
      <meta name="robots" content="index, follow" />
      
      {/* Аналитика */}
      {siteSettings?.googleAnalytics && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${siteSettings.googleAnalytics}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteSettings.googleAnalytics}');
              `,
            }}
          />
        </>
      )}
      
      {siteSettings?.yandexMetrica && (
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              
              ym(${siteSettings.yandexMetrica}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true
              });
            `,
          }}
        />
      )}
    </Head>
  );
}
