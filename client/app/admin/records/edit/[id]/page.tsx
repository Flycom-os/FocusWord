'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import RichEditor from '@/src/features/Editor/RichEditor';
import { fetchRecord, updateRecord } from '@/src/shared/api/records';
import { fetchSliders } from '@/src/shared/api/sliders';
import { SliderDto } from '@/src/shared/api/sliders';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { OutputData } from '@editorjs/editorjs';
import styles from './edit.module.css';

export default function EditRecordPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState<any>(null);
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [selectedSlider, setSelectedSlider] = useState<SliderDto | null>(null);
  const [editorData, setEditorData] = useState<OutputData>({ blocks: [] });
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  const [form, setForm] = useState({
    title: '',
    slug: '',
    status: 'draft',
    template: 'default',
    seoTitle: '',
    seoDescription: '',
    metaKeywords: '',
    featuredSliderId: null as number | null,
  });

  useEffect(() => {
    loadRecord();
    loadSliders();
  }, [params.id]);

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
        metaKeywords: data.metaKeywords || '',
        featuredSliderId: data.featuredSliderId || null,
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
    try {
      const data = await fetchSliders();
      setSliders(data);
    } catch (error) {
      console.error('Error loading sliders:', error);
    }
  };

  const handleSliderChange = (sliderId: string) => {
    const slider = sliders.find(s => s.id === parseInt(sliderId));
    setSelectedSlider(slider || null);
    setForm(prev => ({ ...prev, featuredSliderId: slider ? slider.id : null }));
  };

  const handleMediaSelect = () => {
    window.dispatchEvent(new CustomEvent('open-media-picker', {
      detail: {
        onSelect: (media: any) => {
          const mediaBlock = {
            id: Date.now().toString(),
            type: 'media',
            data: {
              filename: media.filename,
              url: media.url,
              caption: media.caption || ''
            }
          };
          
          const currentData = editorData || { blocks: [] };
          const newData = {
            ...currentData,
            blocks: [...currentData.blocks, mediaBlock]
          };
          setEditorData(newData);
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
    setLoading(true);
    try {
      const recordData = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status,
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords,
        featuredSliderId: form.featuredSliderId,
        contentBlocks: editorData.blocks,
        content: JSON.stringify({ blocks: editorData.blocks })
      };

      await updateRecord(params.id, recordData);
      showToast('Запись обновлена', 'success');
      router.push('/admin/records');
    } catch (error) {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!record) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Редактирование записи</h1>
        <p>Измените содержимое и настройки записи</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCol}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Заголовок</label>
            <Input 
              value={form.title} 
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Введите заголовок записи"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Slug</label>
            <Input 
              value={form.slug} 
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} 
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Статус</label>
            <select 
              value={form.status} 
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              className={styles.select}
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликована</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Шаблон</label>
            <select 
              value={form.template} 
              onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))}
              className={styles.select}
            >
              <option value="default">По умолчанию</option>
              <option value="blog">Блог</option>
              <option value="news">Новости</option>
            </select>
          </div>

          <div className={styles.editorWrapper}>
            <RichEditor
              holder="editorjs-container"
              data={editorData}
              onChange={setEditorData}
              placeholder="Начните писать содержимое записи здесь..."
              onMediaSelect={handleMediaSelect}
              onSliderSelect={handleSliderSelect}
            />
          </div>

          <div className={styles.actions}>
            <Button
              onClick={handlePreview}
              className={styles.previewButton}
            >
              👁️ Предпросмотр
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.formGroup}>
            <label className={styles.label}>SEO Заголовок</label>
            <Input 
              value={form.seoTitle} 
              onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))}
              placeholder="SEO заголовок"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>SEO Описание</label>
            <textarea
              value={form.seoDescription}
              onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
              placeholder="SEO описание"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Meta Keywords</label>
            <Input 
              value={form.metaKeywords} 
              onChange={(event) => setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))}
              placeholder="ключевые, слова"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Избранный слайдер</label>
            <select 
              value={form.featuredSliderId?.toString() || ''} 
              onChange={(event) => handleSliderChange(event.target.value)}
              className={styles.select}
            >
              <option value="">Нет слайдера</option>
              {sliders.map(slider => (
                <option key={slider.id} value={slider.id.toString()}>
                  {slider.name}
                </option>
              ))}
            </select>
          </div>

          {selectedSlider && (
            <div className={styles.previewSlider}>
              <h4>Предпросмотр слайдера</h4>
              <p><strong>{selectedSlider.name}</strong></p>
              <p>{selectedSlider.description}</p>
              <div className={styles.sliderPreview}>
                <div className={styles.slideItem}>Слайд 1</div>
                <div className={styles.slideItem}>Слайд 2</div>
                <div className={styles.slideItem}>Слайд 3</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className={styles.previewModal}>
          <div className={styles.previewModalContent}>
            <div className={styles.previewModalHeader}>
              <h3>Предпросмотр записи</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div 
              className={styles.previewModalBody}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
