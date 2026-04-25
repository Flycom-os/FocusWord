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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";

export const seoApi = {
  // Получить SEO настройки
  getSettings: async (): Promise<SEOSettings> => {
    const response = await fetch(`${API_URL}/api/seo/settings`);
    if (!response.ok) {
      throw new Error('Failed to fetch SEO settings');
    }
    return response.json();
  },

  // Сохранить SEO настройки
  saveSettings: async (settings: SEOSettings): Promise<void> => {
    const response = await fetch(`${API_URL}/api/seo/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save SEO settings');
    }
  },

  // Генерировать robots.txt
  generateRobotsTxt: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/api/seo/robots.txt`);
    if (!response.ok) {
      throw new Error('Failed to generate robots.txt');
    }
    return response.text();
  },

  // Генерировать sitemap.xml
  generateSitemap: async (): Promise<string> => {
    const response = await fetch(`${API_URL}/api/seo/sitemap.xml`);
    if (!response.ok) {
      throw new Error('Failed to generate sitemap');
    }
    return response.text();
  },

  // Получить мета-теги для страницы
  getPageMeta: async (slug: string): Promise<{
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  }> => {
    const response = await fetch(`${API_URL}/api/seo/page-meta/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch page meta');
    }
    return response.json();
  },
};
