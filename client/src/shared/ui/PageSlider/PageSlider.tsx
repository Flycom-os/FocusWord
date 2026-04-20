'use client';

import React, { useEffect, useState } from 'react';
import styles from './PageSlider.module.css';

export interface PageSliderProps {
  slider?: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    slides?: Array<{
      id: number;
      title?: string;
      description?: string;
      linkUrl?: string;
      sortOrder: number;
      image?: {
        id: number;
        filename: string;
        filepath: string;
      } | null;
    }>;
  } | null;
  autoPlay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

const PageSlider: React.FC<PageSliderProps> = ({
  slider,
  autoPlay = true,
  interval = 5000,
  showArrows = true,
  showDots = true,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slider || !slider.slides || slider.slides.length === 0) {
    return null;
  }

  const slides = slider.slides.sort((a, b) => a.sortOrder - b.sortOrder);

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, slides.length - 1)));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getImageUrl = (filepath: string): string => {
    if (filepath.startsWith('http')) {
      return filepath;
    }
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1331';
    return `${API_URL}/uploads/${filepath}`;
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderWrapper}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${index === currentSlide ? styles.slideActive : ''}`}
          >
            {slide.image ? (
              <img
                src={getImageUrl(slide.image.filepath)}
                alt={slide.title || slide.image.filename}
                className={styles.slideImage}
              />
            ) : (
              <div className={styles.slidePlaceholder}>Нет изображения</div>
            )}

            {(slide.title || slide.description) && (
              <div className={styles.slideContent}>
                {slide.title && <h3 className={styles.slideTitle}>{slide.title}</h3>}
                {slide.description && (
                  <p className={styles.slideDescription}>{slide.description}</p>
                )}
                {slide.linkUrl && (
                  <a href={slide.linkUrl} className={styles.slideLink} target="_blank" rel="noopener noreferrer">
                    Подробнее →
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showArrows && slides.length > 1 && (
        <>
          <button
            className={styles.arrowPrev}
            onClick={prevSlide}
            aria-label="Предыдущий слайд"
          >
            ←
          </button>
          <button
            className={styles.arrowNext}
            onClick={nextSlide}
            aria-label="Следующий слайд"
          >
            →
          </button>
        </>
      )}

      {showDots && slides.length > 1 && (
        <div className={styles.dots}>
          {slides.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PageSlider;
