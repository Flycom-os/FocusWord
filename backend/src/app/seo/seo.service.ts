import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

export interface SEOSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  ogImage: string;
  favicon: string;
  twitterCard: string;
  googleAnalytics: string;
  yandexMetrica: string;
  robotsTxt: string;
  sitemapXml: string;
}

@Injectable()
export class SeoService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultSettings: SEOSettings = {
    siteTitle: 'FocusWord',
    siteDescription: 'FocusWord CMS Platform',
    siteKeywords: 'cms, blog, nextjs, nestjs',
    ogImage: '',
    favicon: '/favicon.ico',
    twitterCard: 'summary_large_image',
    googleAnalytics: '',
    yandexMetrica: '',
    robotsTxt: 'User-agent: *\nDisallow: /admin\nSitemap: /sitemap.xml',
    sitemapXml: '',
  };

  async getSettings(): Promise<SEOSettings> {
    const settings = await this.prisma.sEOSetting.findMany();
    const result = { ...this.defaultSettings };
    for (const item of settings) {
      if (item.key in result) {
        result[item.key as keyof SEOSettings] = item.value || '';
      }
    }
    return result;
  }

  async saveSettings(settings: SEOSettings): Promise<void> {
    const keys = Object.keys(settings) as Array<keyof SEOSettings>;

    await Promise.all(
      keys.map(async (key) => {
        await this.prisma.sEOSetting.upsert({
          where: { key },
          update: { value: settings[key] },
          create: { key, value: settings[key] },
        });
      }),
    );
  }

  async generateRobotsTxt(): Promise<string> {
    const settings = await this.getSettings();
    return (
      settings.robotsTxt ||
      'User-agent: *\nDisallow: /admin\nSitemap: /sitemap.xml'
    );
  }

  async generateSitemap(): Promise<string> {
    const settings = await this.getSettings();
    if (settings.sitemapXml) {
      return settings.sitemapXml;
    }

    // Generate dynamic sitemap from DB
    const baseUrl = 'http://localhost:3000'; // Fallback base URL

    const [pages, blogPosts, articles, records] = await Promise.all([
      this.prisma.page.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.article.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      }),
      this.prisma.record.findMany({
        where: { status: 'published' },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Home page
    xml += `  <url>\n    <loc>${baseUrl}</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

    // Pages
    for (const page of pages) {
      if (page.slug === 'home' || page.slug === 'index') continue;
      xml += `  <url>\n    <loc>${baseUrl}/${page.slug}</loc>\n    <lastmod>${page.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    }

    // Blog
    for (const post of blogPosts) {
      xml += `  <url>\n    <loc>${baseUrl}/blog/${post.slug}</loc>\n    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Articles
    for (const article of articles) {
      xml += `  <url>\n    <loc>${baseUrl}/articles/${article.slug}</loc>\n    <lastmod>${article.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
    }

    // Records
    for (const record of records) {
      xml += `  <url>\n    <loc>${baseUrl}/records/${record.slug}</loc>\n    <lastmod>${record.updatedAt.toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  async getPageMeta(slug: string) {
    const siteSettings = await this.getSettings();

    // Check records first, then blog posts, articles, and pages
    const [record, blogPost, article, page] = await Promise.all([
      this.prisma.record.findUnique({
        where: { slug },
        include: { featuredImage: true },
      }),
      this.prisma.blogPost.findUnique({
        where: { slug },
        include: { featuredImage: true },
      }),
      this.prisma.article.findUnique({
        where: { slug },
        include: { featuredImage: true },
      }),
      this.prisma.page.findUnique({
        where: { slug },
        include: { featuredImage: true },
      }),
    ]);

    const entity = record || blogPost || article || page;

    if (!entity) {
      return {
        title: siteSettings.siteTitle,
        description: siteSettings.siteDescription,
        keywords: siteSettings.siteKeywords,
        ogImage: siteSettings.ogImage,
      };
    }

    const title = entity.seoTitle || entity.title || siteSettings.siteTitle;
    const description = entity.seoDescription || siteSettings.siteDescription;
    const keywords =
      entity.metaKeywords && entity.metaKeywords.length > 0
        ? entity.metaKeywords.join(', ')
        : siteSettings.siteKeywords;

    const ogImage = entity.featuredImage?.filepath || siteSettings.ogImage;

    return {
      title,
      description,
      keywords,
      ogImage,
    };
  }
}
