'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../create.module.css';
import { useAuth } from '@/src/app/providers/auth-provider';
import { createPage, updatePage, PageDto, fetchPage } from '@/src/shared/api/pages';
import { fetchSliders, SliderDto } from '@/src/shared/api/sliders';
import { Notifications, UiButton, showToast } from '@/src/shared/ui';
import Input from '@/src/shared/ui/Input/ui-input';
import { OutputData } from '@editorjs/editorjs';
import { MediaPickerModal } from '@/src/features/Media/ui/MediaPickerModal';
import DescriptionFieldWrapper from '../DescriptionFieldWrapper';

type EditorForm = {
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  featuredSliderId?: number | null;
};

const defaultForm: EditorForm = {
  title: '',
  slug: '',
  status: 'draft',
  template: 'default',
  seoTitle: '',
  seoDescription: '',
  metaKeywords: '',
  featuredSliderId: null,
};

const EditPagePage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [pageId] = useState(params.id);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{ onSelect: (media: any) => void } | null>(null);
  const [selectedSlider, setSelectedSlider] = useState<SliderDto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    const loadPageData = async () => {
      if (!accessToken || !pageId) return;
      setIsLoading(true);
      try {
        const page = await fetchPage(accessToken, parseInt(pageId));
        setForm({
          title: page.title || '',
          slug: page.slug || '',
          status: page.status || 'draft',
          template: page.template || 'default',
          seoTitle: page.seoTitle || '',
          seoDescription: page.seoDescription || '',
          metaKeywords: (page.metaKeywords || []).join(', '),
          featuredSliderId: page.featuredSliderId || null,
        });
        
        // Set selected slider for preview
        if (page.featuredSliderId) {
          const slider = sliders.find(s => s.id === page.featuredSliderId);
          setSelectedSlider(slider || null);
        }
        
        // Convert contentBlocks back to Editor.js format if exists
        console.log('Page data:', page);
        console.log('Content blocks:', page.contentBlocks);
        if (page.contentBlocks && Array.isArray(page.contentBlocks)) {
          const editorData = {
            blocks: page.contentBlocks.map(block => ({
              type: block.type,
              data: block.config
            }))
          };
          console.log('Converted editor data:', editorData);
          setEditorData(editorData);
        } else {
          // If no contentBlocks, try to use content field
          if (page.content) {
            try {
              const contentBlocks = JSON.parse(page.content);
              if (Array.isArray(contentBlocks)) {
                const editorData = {
                  blocks: contentBlocks
                };
                console.log('Parsed content blocks:', editorData);
                setEditorData(editorData);
              }
            } catch (error) {
              console.log('Failed to parse content, using empty data');
              setEditorData({ blocks: [] });
            }
          } else {
            console.log('No content found, using empty data');
            setEditorData({ blocks: [] });
          }
        }
      } catch (error: any) {
        showToast('Failed to load page data', 'error');
        router.push('/admin/pages');
      } finally {
        setIsLoading(false);
      }
    };

    loadPageData();
    loadSliders();
  }, [accessToken, pageId]);

  useEffect(() => {
    const handleOpenMediaPicker = (event: CustomEvent) => {
      setMediaPickerCallback({ onSelect: event.detail.onSelect });
      setIsMediaPickerOpen(true);
    };

    window.addEventListener('open-media-picker', handleOpenMediaPicker as EventListener);

    return () => {
      window.removeEventListener('open-media-picker', handleOpenMediaPicker as EventListener);
    };
  }, []);

  
  const loadSliders = async () => {
    if (!accessToken) return;
    try {
      const res = await fetchSliders(accessToken, { page: 1, limit: 100 });
      setSliders(res.data);
    } catch (error) {
      console.error('Error loading sliders:', error);
    }
  };

  // Общая функция конвертации блоков в Markdown
  const convertBlocksToMarkdown = (blocks: any[]): string => {
    if (!blocks || !Array.isArray(blocks)) return '';
    
    return blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return block.data?.text || '';
        case 'header':
          const level = block.data?.level || 1;
          const headerText = block.data?.text || '';
          return `${'#'.repeat(level)} ${headerText}`;
        case 'list':
          if (Array.isArray(block.data?.items)) {
            const items = block.data.items.filter((item: string) => item.trim());
            if (block.data?.style === 'ordered') {
              return items.map((item: string, index: number) => `${index + 1}. ${item}`).join('\n');
            } else {
              return items.map((item: string) => `- ${item}`).join('\n');
            }
          }
          return '';
        case 'media':
          return `📷 Медиа: ${block.data?.filename || 'Без имени'}`;
        case 'slider':
          return `🎠 Слайдер: ${block.data?.name || 'Без названия'}`;
        default:
          return '';
      }
    }).filter(text => text.trim()).join('\n\n');
  };

  const handleMediaSelect = () => {
    // Открываем медиа пикер через кастомное событие
    window.dispatchEvent(new CustomEvent('open-media-picker', {
      detail: {
        onSelect: (media: any) => {
          // Добавляем медиа блок в JSON
          const mediaBlock = {
            id: Date.now().toString(),
            type: 'media',
            data: {
              filename: media.filename,
              url: media.filepath,
              caption: media.altText || ''
            }
          };
          
          const currentBlocks = editorData?.blocks || [];
          const newBlocks = [...currentBlocks, mediaBlock];
          setEditorData({ blocks: newBlocks });
        }
      }
    }));
  };

  const handleSliderSelect = () => {
    // Создаем простой селектор слайдеров
    if (sliders.length === 0) {
      showToast('Сначала создайте слайдеры', 'error');
      return;
    }
    
    // Создаем модальное окно для выбора слайдера
    const sliderHtml = `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000;">
        <div style="background: white; border-radius: 12px; max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto; padding: 24px;">
          <h3 style="margin: 0 0 20px 0; font-size: 18px; font-weight: 600; color: #1f2937;">Выберите слайдер</h3>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${sliders.map(slider => `
              <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; cursor: pointer; transition: all 0.2s;" 
                   onmouseover="this.style.background='#f9fafb'" 
                   onmouseout="this.style.background='white'"
                   onclick="selectSliderEdit(${JSON.stringify(slider).replace(/"/g, '&quot;')})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${slider.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Slug: /${slider.slug}</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">${slider.description || 'Нет описания'}</p>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="closeSliderModalEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Вставляем модальное окно в DOM
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = sliderHtml;
    document.body.appendChild(modalDiv);
    
    // Функции для модального окна
    (window as any).selectSliderEdit = (slider: any) => {
      // Добавляем слайдер блок в JSON
      const sliderBlock = {
        id: Date.now().toString(),
        type: 'slider',
        data: {
          name: slider.name,
          slug: slider.slug,
          description: slider.description
        }
      };
      
      const currentBlocks = editorData?.blocks || [];
      const newBlocks = [...currentBlocks, sliderBlock];
      setEditorData({ blocks: newBlocks });
      (window as any).closeSliderModalEdit();
    };
    
    (window as any).closeSliderModalEdit = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectSliderEdit;
      delete (window as any).closeSliderModalEdit;
    };
  };

  const handlePreview = () => {
    if (!editorData) return;
    
    // Enhanced preview with better formatting and media/slider display
    const html = `
      <style>
        .preview-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 100%;
        }
        .preview-container h1, .preview-container h2, .preview-container h3 {
          margin: 24px 0 16px 0;
          font-weight: 600;
          color: #111827;
        }
        .preview-container h1 { font-size: 2.25rem; }
        .preview-container h2 { font-size: 1.875rem; }
        .preview-container h3 { font-size: 1.5rem; }
        .preview-container p {
          margin: 16px 0;
          color: #4b5563;
        }
        .preview-container ul, .preview-container ol {
          margin: 16px 0;
          padding-left: 24px;
        }
        .preview-container li {
          margin: 8px 0;
          color: #4b5563;
        }
        .preview-container strong {
          font-weight: 600;
          color: #111827;
        }
        .preview-container em {
          font-style: italic;
          color: #6b7280;
        }
        .preview-container u {
          text-decoration: underline;
        }
        .preview-container blockquote {
          margin: 20px 0;
          padding: 16px 20px;
          background: #f9fafb;
          border-left: 4px solid #3b82f6;
          color: #4b5563;
          font-style: italic;
        }
        .preview-container code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          color: #dc2626;
        }
        .preview-container pre {
          background: #1f2937;
          color: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 20px 0;
        }
        .preview-container pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .media-block, .slider-block {
          margin: 24px 0;
          padding: 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .media-block h4, .slider-block h4 {
          margin: 0 0 12px 0;
          color: #1e293b;
          font-size: 1.125rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .media-info, .slider-info {
          margin: 12px 0;
          font-size: 0.875rem;
          color: #64748b;
        }
        .media-preview img {
          max-width: 300px;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .media-preview video, .media-preview audio {
          max-width: 100%;
          border-radius: 8px;
        }
        .slider-preview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-top: 16px;
        }
        .slide-item {
          aspect-ratio: 16/9;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .slide-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .empty-slide {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          font-size: 0.875rem;
        }
      </style>
      <div class="preview-container">
        ${editorData.blocks.map(block => {
          switch (block.type) {
            case 'paragraph':
              const text = block.data?.text || '';
              // Enhanced text formatting
              let formattedText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/__(.*?)__/g, '<u>$1</u>')
                .replace(/`(.*?)`/g, '<code>$1</code>');
              
              // Handle blockquotes
              if (formattedText.startsWith('> ')) {
                return `<blockquote>${formattedText.substring(2)}</blockquote>`;
              }
              
              return `<p>${formattedText}</p>`;
              
            case 'header':
              return `<h${block.data?.level || 1}>${block.data?.text || ''}</h${block.data?.level || 1}>`;
              
            case 'list':
              const items = (block.data?.items || [])
                .filter((item: string) => item.trim())
                .map((item: string) => {
                  // Format list items
                  let formattedItem = item
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/__(.*?)__/g, '<u>$1</u>');
                  return `<li>${formattedItem}</li>`;
                }).join('');
              return block.data?.style === 'ordered' ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
              
            case 'image':
              if (block.data?.url) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
                const imageUrl = block.data.url.startsWith('http') 
                  ? block.data.url 
                  : `${API_URL}${block.data.url}`;
                return `
                  <div class="media-block">
                    <img src="${imageUrl}" alt="${block.data.caption || ''}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                    ${block.data.caption ? `<p><em>${block.data.caption}</em></p>` : ''}
                  </div>
                `;
              }
              return '';
              
            case 'media':
              if (block.data?.url || block.data?.filepath) {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
                // Используем filepath или url, prioritize filepath
                const mediaPath = block.data.filepath || block.data.url;
                const mediaUrl = mediaPath.startsWith('http') 
                  ? mediaPath 
                  : `${API_URL}${mediaPath}`;
                
                const filename = block.data?.filename || '';
                const isVideo = filename.match(/\.(mp4|webm|ogg|avi|mov)$/i);
                const isAudio = filename.match(/\.(mp3|wav|ogg|flac|m4a)$/i);
                const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                
                // Добавляем отладочную информацию
                console.log('Media preview:', { filename, mediaUrl, isVideo, isAudio, isImage });
                
                let mediaContent = '';
                if (isVideo) {
                  mediaContent = `<video controls style="max-width: 100%; border-radius: 8px;" preload="metadata"><source src="${mediaUrl}" type="video/mp4">Ваш браузер не поддерживает видео.</video>`;
                } else if (isAudio) {
                  mediaContent = `<audio controls style="width: 100%; margin: 12px 0;" preload="metadata"><source src="${mediaUrl}" type="audio/mpeg">Ваш браузер не поддерживает аудио.</audio>`;
                } else if (isImage) {
                  mediaContent = `<img src="${mediaUrl}" alt="${block.data.caption || ''}" style="max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><div style="display:none; text-align:center; padding:20px; background:#f1f5f9; border-radius:8px;"><div style="font-size:2rem;">🖼️</div><p>Ошибка загрузки изображения</p><p><small>${mediaUrl}</small></p></div>`;
                } else {
                  mediaContent = `<div style="text-align: center; padding: 20px; background: #f1f5f9; border-radius: 8px;"><div style="font-size: 2rem;">📄</div><p>${filename}</p><p><small>Тип файла не поддерживается для предпросмотра</small></p></div>`;
                }
                
                return `
                  <div class="media-block">
                    <h4>📷 Медиафайл</h4>
                    <div class="media-info">
                      <p><strong>Файл:</strong> ${filename}</p>
                      ${block.data.caption ? `<p><strong>Описание:</strong> ${block.data.caption}</p>` : ''}
                    </div>
                    <div class="media-preview">
                      ${mediaContent}
                    </div>
                  </div>
                `;
              }
              return '';
              
            case 'slider':
              const slider = sliders.find(s => s.slug === block.data?.slug);
              if (slider && (slider as any).slides && (slider as any).slides.length > 0) {
                const slideItems = (slider as any).slides.map((slide: any, index: number) => {
                  if (slide.media && (slide.media.url || slide.media.filepath)) {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
                    // Используем filepath или url, prioritize filepath
                    const mediaPath = slide.media.filepath || slide.media.url;
                    const mediaUrl = mediaPath.startsWith('http') 
                      ? mediaPath 
                      : `${API_URL}${mediaPath}`;
                    
                    const filename = slide.media.filename || '';
                    const isVideo = filename.match(/\.(mp4|webm|ogg|avi|mov)$/i);
                    const isAudio = filename.match(/\.(mp3|wav|ogg|flac|m4a)$/i);
                    const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
                    
                    console.log('Slider slide media:', { filename, mediaUrl, isVideo, isAudio, isImage });
                    
                    if (isVideo) {
                      return `<div class="slide-item"><video muted loop autoplay style="width: 100%; height: 100%; object-fit: cover;"><source src="${mediaUrl}" type="video/mp4"></video></div>`;
                    } else if (isAudio) {
                      return `<div class="slide-item"><div class="empty-slide"><div style="font-size: 2rem;">🎵</div><p>${slide.media.caption || 'Аудио'}</p></div></div>`;
                    } else if (isImage) {
                      return `<div class="slide-item"><img src="${mediaUrl}" alt="${slide.media.caption || ''}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" /><div style="display:none; width:100%; height:100%; object-fit:cover; align-items:center; justify-content:center; background:#f1f5f9; border-radius:8px;"><div style="font-size:2rem;">🖼️</div><p>Ошибка загрузки</p></div></div>`;
                    } else {
                      return `<div class="slide-item"><div class="empty-slide"><div style="font-size: 2rem;">📄</div><p>${slide.media.filename || 'Файл'}</p></div></div>`;
                    }
                  } else {
                    return `<div class="slide-item"><div class="empty-slide"><div style="font-size: 2rem;">📷</div><p>Слайд ${index + 1}</p></div></div>`;
                  }
                }).join('');
                
                return `
                  <div class="slider-block">
                    <h4>🎠 Слайдер: ${block.data?.name || 'Без названия'}</h4>
                    <div class="slider-info">
                      <p><strong>Slug:</strong> /${block.data?.slug || 'no-slug'}</p>
                      <p><strong>Описание:</strong> ${block.data?.description || 'Нет описания'}</p>
                      <p><strong>Слайдов:</strong> ${(slider as any).slides.length}</p>
                    </div>
                    <div class="slider-preview">
                      ${slideItems}
                    </div>
                  </div>
                `;
              } else {
                return `
                  <div class="slider-block">
                    <h4>🎠 Слайдер: ${block.data?.name || 'Без названия'}</h4>
                    <div class="slider-info">
                      <p><strong>Slug:</strong> /${block.data?.slug || 'no-slug'}</p>
                      <p><strong>Описание:</strong> ${block.data?.description || 'Нет описания'}</p>
                      <p style="color: #ef4444;">⚠️ Слайдер не найден или нет слайдов</p>
                    </div>
                    <div class="slider-preview">
                      <div class="slide-item"><div class="empty-slide"><div style="font-size: 2rem;">🎠</div><p>Нет слайдов</p></div></div>
                    </div>
                  </div>
                `;
              }
              
            default:
              return '';
          }
        }).join('\n')}
      </div>
    `;
    
    setPreviewContent(html);
    setShowPreview(true);
  };

  const handleSliderChange = (sliderId: string) => {
    const slider = sliders.find(s => s.id === parseInt(sliderId));
    setSelectedSlider(slider || null);
  };

  const handleSave = async () => {
    if (!accessToken || !pageId) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast('Название и slug обязательны', 'error');
      return;
    }
    setIsSaving(true);
    
    try {
      const pageData = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status,
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        featuredSliderId: form.featuredSliderId || undefined,
        contentBlocks: editorData ? editorData.blocks.map(block => ({
          type: block.type as any,
          id: Date.now() + Math.random(),
          config: block.data
        })) : [],
        content: editorData ? JSON.stringify(editorData.blocks) : '',
      };

      await updatePage(accessToken, parseInt(pageId), pageData);
      showToast('Страница обновлена', 'success');
      router.push('/admin/pages');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Ошибка сохранения', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Notifications />
      <MediaPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaPickerCallback) {
            mediaPickerCallback.onSelect(media);
          }
          setIsMediaPickerOpen(false);
        }}
        zIndex={2001}
      />

      <div className={styles.header}>
        <div className={styles.breadcrumb}>
          <button onClick={() => router.push('/admin/pages')} className={styles.backButton}>
            ← Назад к страницам
          </button>
          <h1>Редактировать страницу</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Предпросмотр
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push('/admin/pages')}>
            Отмена
          </UiButton>
          <UiButton theme="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Обновить'}
          </UiButton>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.grid}>
          <div className={styles.mainCol}>
            <Input
              className={styles.input}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Название страницы"
            />
            
            <div className={styles.editorWrapper}>
              <DescriptionFieldWrapper
                value={editorData ? JSON.stringify(editorData.blocks) : ''}
                onChange={(value) => {
                  try {
                    const blocks = value ? JSON.parse(value) : [];
                    setEditorData({ blocks });
                  } catch (e) {
                    // Если не JSON, создаем параграф
                    setEditorData({ 
                      blocks: [{
                        id: Date.now().toString(),
                        type: 'paragraph',
                        data: { text: value }
                      }]
                    });
                  }
                }}
                placeholder="Начните писать контент страницы здесь..."
                id="page-content"
                label="Контент страницы"
                onMediaSelect={handleMediaSelect}
                onSliderSelect={handleSliderSelect}
                convertJsonToMarkdown={(jsonValue) => convertBlocksToMarkdown(JSON.parse(jsonValue || '[]'))}
              />
            </div>
          </div>

          <div className={styles.sideCol}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Slug</label>
              <Input 
                value={form.slug} 
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Статус</label>
              <select
                className={styles.select}
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="draft">Черновик</option>
                <option value="published">Опубликовано</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Шаблон</label>
              <Input 
                value={form.template} 
                onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO заголовок</label>
              <Input 
                value={form.seoTitle} 
                onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>SEO описание</label>
              <textarea
                className={styles.textarea}
                value={form.seoDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Ключевые слова (через запятую)</label>
              <Input 
                value={form.metaKeywords} 
                onChange={(event) => setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))} 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Основной слайдер</label>
              <select
                className={styles.select}
                value={form.featuredSliderId?.toString() || ''}
                onChange={(e) => {
                  setForm((prev) => ({ 
                    ...prev, 
                    featuredSliderId: e.target.value ? parseInt(e.target.value) : null 
                  }));
                  handleSliderChange(e.target.value);
                }}
              >
                <option value="">Без слайдера</option>
                {sliders.map((slider) => (
                  <option key={slider.id} value={slider.id.toString()}>
                    {slider.name}
                  </option>
                ))}
              </select>
              
              {selectedSlider && (
                <div className={styles.sliderPreview}>
                  <h4>Предпросмотр слайдера: {selectedSlider.name}</h4>
                  <div className={styles.sliderInfo}>
                    <p><strong>Slug:</strong> /{selectedSlider.slug}</p>
                    <p><strong>Описание:</strong> {selectedSlider.description || 'Нет описания'}</p>
                    <p><strong>Создан:</strong> {new Date(selectedSlider.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.sliderPlaceholder}>
                    <div className={styles.sliderAnimation}>
                      <div className={styles.slide}>Слайд 1</div>
                      <div className={styles.slide}>Слайд 2</div>
                      <div className={styles.slide}>Слайд 3</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className={styles.previewOverlay}>
          <div className={styles.previewModal}>
            <div className={styles.previewHeader}>
              <h3>Предпросмотр страницы</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowPreview(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.previewContent}>
              <h1>{form.title}</h1>
              <div className={styles.previewMeta}>
                <span>Slug: /{form.slug}</span>
                <span>Статус: {form.status === 'published' ? 'Опубликовано' : 'Черновик'}</span>
              </div>
              <div 
                className={styles.previewBody}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
              {selectedSlider && (
                <div className={styles.previewSlider}>
                  <h4>Основной слайдер: {selectedSlider.name}</h4>
                  <div className={styles.sliderPlaceholder}>
                    <div className={styles.sliderAnimation}>
                      <div className={styles.slide}>Слайд 1</div>
                      <div className={styles.slide}>Слайд 2</div>
                      <div className={styles.slide}>Слайд 3</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={styles.previewActions}>
              <UiButton theme="secondary" onClick={() => setShowPreview(false)}>
                Закрыть
              </UiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPagePage;
