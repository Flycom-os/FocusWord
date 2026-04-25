'use client';

import { useState, useEffect } from 'react';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import styles from './seo.module.css';

interface SEOSettings {
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

export default function SEOPage() {
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    siteTitle: '',
    siteDescription: '',
    siteKeywords: '',
    ogImage: '',
    favicon: '',
    twitterCard: 'summary_large_image',
    googleAnalytics: '',
    yandexMetrica: '',
    robotsTxt: '',
    sitemapXml: ''
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'analytics' | 'technical'>('general');

  useEffect(() => {
    loadSEOSettings();
  }, []);

  const loadSEOSettings = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}/api/seo/settings`);
      if (response.ok) {
        const data = await response.json();
        setSeoSettings(data);
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331'}/api/seo/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(seoSettings),
      });

      if (response.ok) {
        showToast('SEO настройки сохранены', 'success');
      } else {
        showToast('Ошибка при сохранении', 'error');
      }
    } catch (error) {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (type: 'ogImage' | 'favicon') => {
    window.dispatchEvent(new CustomEvent('open-media-picker', {
      detail: {
        onSelect: (media: any) => {
          setSeoSettings(prev => ({
            ...prev,
            [type]: media.url
          }));
        }
      }
    }));
  };

  const renderGeneralTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Название сайта</label>
        <Input
          value={seoSettings.siteTitle}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, siteTitle: e.target.value }))}
          placeholder="Название вашего сайта"
          maxLength={60}
        />
        <small className={styles.hint}>Рекомендуется 60 символов</small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Описание сайта</label>
        <textarea
          className={styles.textarea}
          value={seoSettings.siteDescription}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
          placeholder="Описание вашего сайта для поисковых систем"
          maxLength={160}
          rows={3}
        />
        <small className={styles.hint}>Рекомендуется 160 символов</small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Ключевые слова</label>
        <Input
          value={seoSettings.siteKeywords}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, siteKeywords: e.target.value }))}
          placeholder="ключевое1, ключевое2, ключевое3"
        />
        <small className={styles.hint}>Через запятую</small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Favicon</label>
        <div className={styles.mediaInput}>
          <Input
            value={seoSettings.favicon}
            onChange={(e) => setSeoSettings(prev => ({ ...prev, favicon: e.target.value }))}
            placeholder="URL favicon"
            readOnly
          />
          <Button
            type="button"
            onClick={() => handleImageSelect('favicon')}
            className={styles.mediaButton}
          >
            📷 Выбрать
          </Button>
        </div>
        {seoSettings.favicon && (
          <div className={styles.preview}>
            <img src={seoSettings.favicon} alt="Favicon" className={styles.faviconPreview} />
          </div>
        )}
      </div>
    </div>
  );

  const renderSocialTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>OG Image (для соцсетей)</label>
        <div className={styles.mediaInput}>
          <Input
            value={seoSettings.ogImage}
            onChange={(e) => setSeoSettings(prev => ({ ...prev, ogImage: e.target.value }))}
            placeholder="URL изображения для соцсетей"
            readOnly
          />
          <Button
            type="button"
            onClick={() => handleImageSelect('ogImage')}
            className={styles.mediaButton}
          >
            📷 Выбрать
          </Button>
        </div>
        {seoSettings.ogImage && (
          <div className={styles.preview}>
            <img src={seoSettings.ogImage} alt="OG Image" className={styles.ogPreview} />
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Twitter Card Type</label>
        <select
          className={styles.select}
          value={seoSettings.twitterCard}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, twitterCard: e.target.value }))}
        >
          <option value="summary">Summary</option>
          <option value="summary_large_image">Summary with Large Image</option>
          <option value="app">App</option>
          <option value="player">Player</option>
        </select>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>Google Analytics ID</label>
        <Input
          value={seoSettings.googleAnalytics}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, googleAnalytics: e.target.value }))}
          placeholder="G-XXXXXXXXXX"
        />
        <small className={styles.hint}>Google Analytics 4 Measurement ID</small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Яндекс Метрика ID</label>
        <Input
          value={seoSettings.yandexMetrica}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, yandexMetrica: e.target.value }))}
          placeholder="XXXXXXXXXXXXXXX"
        />
        <small className={styles.hint}>Яндекс Метрика счетчик</small>
      </div>
    </div>
  );

  const renderTechnicalTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.formGroup}>
        <label className={styles.label}>robots.txt</label>
        <textarea
          className={styles.textarea}
          value={seoSettings.robotsTxt}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, robotsTxt: e.target.value }))}
          placeholder="User-agent: *&#10;Allow: /&#10;Sitemap: https://yoursite.com/sitemap.xml"
          rows={8}
        />
        <small className={styles.hint}>Файл инструкций для поисковых роботов</small>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>sitemap.xml</label>
        <textarea
          className={styles.textarea}
          value={seoSettings.sitemapXml}
          onChange={(e) => setSeoSettings(prev => ({ ...prev, sitemapXml: e.target.value }))}
          placeholder="<?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?>&#10;<urlset xmlns=&quot;http://www.sitemaps.org/schemas/sitemap/0.9&quot;>&#10;  <url>&#10;    <loc>https://yoursite.com</loc>&#10;    <lastmod>2024-01-01</lastmod>&#10;    <priority>1.0</priority>&#10;  </url>&#10;</urlset>"
          rows={10}
        />
        <small className={styles.hint}>XML карта сайта для поисковых систем</small>
      </div>
    </div>
  );

  return (
    <div className={styles.seoPage}>
      <div className={styles.header}>
        <h1>SEO Настройки</h1>
        <p>Управление SEO параметрами сайта</p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'general' ? styles.active : ''}`}
          onClick={() => setActiveTab('general')}
        >
          🌐 Общие
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'social' ? styles.active : ''}`}
          onClick={() => setActiveTab('social')}
        >
          📱 Соцсети
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📊 Аналитика
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'technical' ? styles.active : ''}`}
          onClick={() => setActiveTab('technical')}
        >
          ⚙️ Техническое
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'general' && renderGeneralTab()}
        {activeTab === 'social' && renderSocialTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'technical' && renderTechnicalTab()}

        <div className={styles.actions}>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={styles.saveButton}
          >
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </Button>
        </div>
      </div>
    </div>
  );
}
