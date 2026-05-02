'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import DescriptionFieldWrapper from '../DescriptionFieldWrapper';
import { fetchRecord, updateRecord, createRecord } from '@/src/shared/api/records';
import { fetchSliders } from '@/src/shared/api/sliders';
import { SliderDto } from '@/src/shared/api/sliders';
import { fetchCategories } from '@/src/shared/api/records';
import { CategoryDto } from '@/src/shared/api/records';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { OutputData } from '@editorjs/editorjs';
import { MediaPickerModal } from '@/src/features/Media/ui/MediaPickerModal';
import { Notifications, UiButton } from '@/src/shared/ui';
import styles from './edit.module.css';

type EditorForm = {
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  featuredSliderId?: number | null;
  categoryIds: number[];
};

export default function EditRecordPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [form, setForm] = useState<EditorForm>({
    title: '',
    slug: '',
    status: 'draft',
    template: 'default',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    featuredSliderId: null,
    categoryIds: [],
  });
  const [editorData, setEditorData] = useState<OutputData>();
  const [isSaving, setIsSaving] = useState(false);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{ onSelect: (media: any) => void } | null>(null);
  const [selectedSlider, setSelectedSlider] = useState<SliderDto | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  useEffect(() => {
    loadRecord();
    loadSliders();
    loadCategories();
    setupMediaPicker();
  }, [params.id]);

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

  const setupMediaPicker = () => {
    // This will be called after sliders are loaded
  };

  const loadRecord = async () => {
    try {
      const data = await fetchRecord(params.id);
      setRecord(data);
      
      setForm({
        title: data.title || '',
        slug: data.slug || '',
        status: data.status || 'draft',
        template: data.template || 'default',
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || '',
        metaKeywords: Array.isArray(data.metaKeywords) ? data.metaKeywords.join(', ') : (data.metaKeywords || ''),
        featuredSliderId: data.featuredSliderId || null,
        categoryIds: data.categories?.map((cat: CategoryDto) => cat.id) || [],
      });

      // Загружаем контент в редактор
      if (data.contentBlocks) {
        setEditorData({ blocks: data.contentBlocks });
      } else if (data.content) {
        try {
          const parsed = JSON.parse(data.content);
          setEditorData({ blocks: parsed.blocks || [] });
        } catch (e) {
          // Если не удалось распарсить, создаем пустой редактор
          setEditorData({ blocks: [] });
        }
      }

      // Устанавливаем выбранный слайдер
      if (data.featuredSliderId) {
        const slider = sliders.find(s => s.id === data.featuredSliderId);
        setSelectedSlider(slider || null);
      }
    } catch (error) {
      showToast('Ошибка при загрузке записи', 'error');
      router.push('/admin/records');
    }
  };

  const loadSliders = async () => {
    if (!accessToken) return;
    try {
      const res = await fetchSliders(accessToken, { page: 1, limit: 100 });
      setSliders(res.data);
    } catch (error) {
      console.error('Error loading sliders:', error);
    }
  };

  const loadCategories = async () => {
    if (!accessToken) return;
    try {
      const res = await fetchCategories(1, 100, '');
      setCategories(res.data);
    } catch (error) {
      console.error('Error loading categories:', error);
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

  const handleSliderChange = (sliderId: string) => {
    const slider = sliders.find(s => s.id === parseInt(sliderId));
    setSelectedSlider(slider || null);
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
                   onclick="selectSliderRecordEdit(${JSON.stringify(slider).replace(/"/g, '&quot;')})">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">${slider.name}</h4>
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280;">Slug: /${slider.slug}</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">${slider.description || 'Нет описания'}</p>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
            <button onclick="closeSliderModalRecordEdit()" style="padding: 8px 16px; border: 1px solid #d1d5db; background: white; border-radius: 6px; cursor: pointer;">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Вставляем модальное окно в DOM
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = sliderHtml;
    document.body.appendChild(modalDiv);
    
    // Функции для модального окна
    (window as any).selectSliderRecordEdit = (slider: any) => {
      // Вставляем слайдер в редактор
      const sliderBlock = {
        id: Date.now().toString(),
        type: 'slider',
        data: {
          name: slider.name,
          slug: slider.slug,
          description: slider.description
        }
      };
      
      const currentData = editorData || { blocks: [] };
      const newData = {
        ...currentData,
        blocks: [...currentData.blocks, sliderBlock]
      };
      setEditorData(newData);
      (window as any).closeSliderModalRecordEdit();
    };
    
    (window as any).closeSliderModalRecordEdit = () => {
      document.body.removeChild(modalDiv);
      delete (window as any).selectSliderRecordEdit;
      delete (window as any).closeSliderModalRecordEdit;
    };
  };

  const handlePreview = () => {
    if (!editorData) return;
    
    // Convert Editor.js blocks to HTML for preview
    const html = editorData.blocks.map(block => {
      switch (block.type) {
        case 'paragraph':
          return `<p>${block.data.text || ''}</p>`;
        case 'header':
          return `<h${block.data.level || 1}>${block.data.text || ''}</h${block.data.level || 1}>`;
        case 'list':
          const items = (block.data.items || [])
            .filter((item: string) => item.trim())
            .map((item: string) => `<li>${item}</li>`).join('');
          return block.data.style === 'ordered' ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
        case 'image':
          if (block.data?.url) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
            const imageUrl = block.data.url.startsWith('http') 
              ? block.data.url 
              : `${API_URL}${block.data.url}`;
            return `<img src="${imageUrl}" alt="${block.data.caption || ''}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" /><p><em>${block.data.caption || ''}</em></p>`;
          }
          return `<div class="preview-placeholder">Изображение: ${block.data?.caption || 'Без заголовка'}</div>`;
        case 'embed':
          if (block.data?.url) {
            return `<div class="preview-embed"><iframe src="${block.data.url}" style="width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 8px;"></iframe></div>`;
          }
          return `<div class="preview-placeholder">Встраивание: ${block.data?.url || 'Без URL'}</div>`;
        case 'slider':
          return `<div class="preview-slider-block">
            <h4>🎠 Слайдер: ${block.data?.name || 'Без названия'}</h4>
            <div class="preview-slider-info">
              <p><strong>Slug:</strong> /${block.data?.slug || 'no-slug'}</p>
              <p><strong>Описание:</strong> ${block.data?.description || 'Нет описания'}</p>
            </div>
            <div class="preview-slider-preview">
              <div class="slide-item">Слайд 1</div>
              <div class="slide-item">Слайд 2</div>
              <div class="slide-item">Слайд 3</div>
            </div>
          </div>`;
        case 'media':
          if (block.data?.url) {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
            const mediaUrl = block.data.url.startsWith('http') 
              ? block.data.url 
              : `${API_URL}${block.data.url}`;
            
            const filename = block.data?.filename || '';
            const isVideo = filename.match(/\.(mp4|webm|ogg|avi|mov)$/i);
            const isAudio = filename.match(/\.(mp3|wav|ogg|flac|m4a)$/i);
            const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);
            
            if (isVideo) {
              return `<div class="preview-media-block">
                <video controls style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <source src="${mediaUrl}" type="video/mp4">
                  Ваш браузер не поддерживает видео.
                </video>
                <p><em>${block.data?.caption || 'Без заголовка'}</em></p>
              </div>`;
            } else if (isAudio) {
              return `<div class="preview-media-block">
                <audio controls style="width: 100%; margin: 8px 0;">
                  <source src="${mediaUrl}" type="audio/mpeg">
                  Ваш браузер не поддерживает аудио.
                </audio>
                <p><em>${block.data?.caption || 'Без заголовка'}</em></p>
              </div>`;
            } else if (isImage) {
              return `<div class="preview-media-block">
                <img src="${mediaUrl}" alt="${block.data?.caption || ''}" style="max-width: 200px; height: 150px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                <p><em>${block.data?.caption || 'Без заголовка'}</em></p>
              </div>`;
            } else {
              return `<div class="preview-media-block">
                <div class="preview-file-icon">📄</div>
                <p><strong>${filename}</strong></p>
                <p><em>${block.data?.caption || 'Без заголовка'}</em></p>
              </div>`;
            }
          }
          return `<div class="preview-placeholder">Медиафайл: ${block.data?.filename || 'Без имени'}</div>`;
        default:
          return `<div class="preview-placeholder">${block.type}: ${JSON.stringify(block.data)}</div>`;
      }
    }).join('\n');
    
    setPreviewContent(html);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast('Название и slug обязательны', 'error');
      return;
    }
    setIsSaving(true);
    
    try {
      const recordData = {
        id: parseInt(params.id),
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status as 'draft' | 'published',
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords ? form.metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0) : [],
        featuredSliderId: form.featuredSliderId || undefined,
        categoryIds: form.categoryIds,
        content: editorData ? JSON.stringify(editorData.blocks) : '',
      };

      await updateRecord(accessToken, params.id, recordData);
      showToast('Запись обновлена', 'success');
      router.push('/admin/records');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Ошибка сохранения', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!record) {
    return <div className={styles.loading}>Загрузка...</div>;
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
          <button onClick={() => router.push('/admin/records')} className={styles.backButton}>
            ← Назад к записям
          </button>
          <h1>Редактировать запись</h1>
        </div>
        <div className={styles.actions}>
          <UiButton theme="secondary" onClick={handlePreview}>
            Предпросмотр
          </UiButton>
          <UiButton theme="secondary" onClick={() => router.push('/admin/records')}>
            Отмена
          </UiButton>
          <UiButton theme="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
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
              placeholder="Название записи"
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
                placeholder="Начните писать контент записи здесь..."
                id="record-content"
                label="Контент записи"
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
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as 'draft' | 'published' }))}
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
              <DescriptionFieldWrapper
                value={form.seoDescription}
                onChange={(value) => setForm((prev) => ({ ...prev, seoDescription: value }))}
                placeholder="Введите SEO описание в Markdown формате..."
                id="seo-description"
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
              <label className={styles.label}>Категории</label>
              <div className={styles.categoriesContainer}>
                {categories.map((category) => (
                  <label key={category.id} className={styles.categoryCheckbox}>
                    <input
                      type="checkbox"
                      checked={form.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setForm((prev) => ({
                            ...prev,
                            categoryIds: [...prev.categoryIds, category.id]
                          }));
                        } else {
                          setForm((prev) => ({
                            ...prev,
                            categoryIds: prev.categoryIds.filter(id => id !== category.id)
                          }));
                        }
                      }}
                    />
                    <span>{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Основной слайдер</label>
              <select
                className={styles.select}
                value={form.featuredSliderId?.toString() || ''}
                onChange={(e) => {
                  setForm((prev) => ({ 
                    ...prev, 
                    featuredSliderId: e.target.value ? parseInt(e.target.value) : undefined
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
              <h3>Предпросмотр записи</h3>
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
}
