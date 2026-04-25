'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import { fetchSliders, updateSlider, getSlider } from '@/src/shared/api/sliders';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { MediaPickerModal } from '@/src/features/Media/ui/MediaPickerModal';
import styles from './edit.module.css';

export default function EditSliderPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{ onSelect: (media: any) => void } | null>(null);

  useEffect(() => {
    loadSlider();
    setupMediaPicker();
  }, [params.id]);

  const loadSlider = async () => {
    try {
      const { accessToken } = useAuth();
      const data = await getSlider(accessToken, parseInt(params.id));
      setSlider(data);
      if (data.slides) {
        setSlides(data.slides);
      }
    } catch (error) {
      showToast('Ошибка при загрузке слайдера', 'error');
      router.push('/admin/sliders');
    }
  };

  const setupMediaPicker = () => {
    window.addEventListener('open-media-picker', handleMediaPickerEvent as EventListener);
  };

  const handleMediaPickerEvent = (event: CustomEvent) => {
    if (mediaPickerCallback) {
      mediaPickerCallback.onSelect(event.detail.onSelect);
    }
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      media: null,
      caption: '',
      order: slides.length + 1
    };
    setSlides([...slides, newSlide]);
  };

  const handleRemoveSlide = (slideId: string) => {
    setSlides(slides.filter(slide => slide.id !== slideId));
  };

  const handleSlideChange = (slideId: string, field: 'media' | 'caption', value: any) => {
    setSlides(slides.map(slide => 
      slide.id === slideId 
        ? { ...slide, [field]: value }
        : slide
    ));
  };

  const handleMediaSelect = () => {
    setMediaPickerCallback({
      onSelect: (media: any) => {
        // Добавляем медиа к последнему слайду
        const lastSlide = slides[slides.length - 1];
        if (lastSlide) {
          handleSlideChange(lastSlide.id, 'media', {
            filename: media.filename,
            url: media.url,
            caption: media.caption || ''
          });
        }
      }
    });
    setShowMediaPicker(true);
  };

  const handleSave = async () => {
    if (!slider) return;
    
    setLoading(true);
    try {
      const sliderData = {
        name: slider.name,
        slug: slider.slug,
        description: slider.description,
        slides: slides
      };

      await updateSlider(params.id, sliderData);
      showToast('Слайдер обновлен', 'success');
      router.push('/admin/sliders');
    } catch (error) {
      showToast('Ошибка при сохранении', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!slider) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Редактирование слайдера</h1>
        <p>Измените слайды и настройки слайдера</p>
      </div>

      <div className={styles.content}>
        <div className={styles.mainCol}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Название слайдера</label>
            <Input 
              value={slider.name} 
              onChange={(e) => setSlider(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название слайдера"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Slug</label>
            <Input 
              value={slider.slug} 
              onChange={(e) => setSlider(prev => ({ ...prev, slug: e.target.value }))} 
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Описание</label>
            <textarea
              value={slider.description || ''}
              onChange={(e) => setSlider(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание слайдера"
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.slidesSection}>
            <div className={styles.slidesHeader}>
              <h3>Слайды</h3>
              <Button
                onClick={handleAddSlide}
                className={styles.addSlideButton}
              >
                ➕ Добавить слайд
              </Button>
            </div>

            <div className={styles.slidesGrid}>
              {slides.map((slide, index) => (
                <div key={slide.id} className={styles.slideCard}>
                  <div className={styles.slideHeader}>
                    <span className={styles.slideNumber}>Слайд {index + 1}</span>
                    <Button
                      onClick={() => handleRemoveSlide(slide.id)}
                      className={styles.removeButton}
                    >
                      🗑️
                    </Button>
                  </div>

                  <div className={styles.slideContent}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Медиафайл</label>
                      <div className={styles.mediaInput}>
                        <Input
                          value={slide.media?.filename || ''}
                          onChange={(e) => handleSlideChange(slide.id, 'media', {
                            filename: e.target.value,
                            url: slide.media?.url || '',
                            caption: slide.media?.caption || ''
                          })}
                          placeholder="Выберите медиафайл"
                          readOnly
                        />
                        <Button
                          onClick={handleMediaSelect}
                          className={styles.selectMediaButton}
                        >
                          📷 Выбрать
                        </Button>
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Подпись</label>
                      <Input
                        value={slide.caption || ''}
                        onChange={(e) => handleSlideChange(slide.id, 'caption', e.target.value)}
                        placeholder="Подпись к слайду"
                      />
                    </div>

                    {slide.media?.url && (
                      <div className={styles.mediaPreview}>
                        <img 
                          src={slide.media.url} 
                          alt={slide.media.caption || ''} 
                          className={styles.mediaImage}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              onClick={handleSave}
              disabled={loading}
              className={styles.saveButton}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
            <Button
              onClick={() => router.push('/admin/sliders')}
              className={styles.cancelButton}
            >
              Отмена
            </Button>
          </div>
        </div>
      </div>

      {showMediaPicker && mediaPickerCallback && (
        <MediaPickerModal
          onSelect={mediaPickerCallback.onSelect}
          onClose={() => setShowMediaPicker(false)}
        />
      )}
    </div>
  );
}
