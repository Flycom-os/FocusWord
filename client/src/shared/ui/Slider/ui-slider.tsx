import React, { useState, useEffect } from 'react';
import styles from './ui-slider.module.css';
import VideoPlayer from '../VideoPlayer/ui-video';
import AudioPlayer from '../AudioPlayer/ui-audio';

export interface SliderItem {
  id: number;
  src: string;
  type: 'image' | 'video' | 'audio';
  alt?: string;
  caption?: string;
}

export interface SliderProps {
  items: SliderItem[];
  initialIndex?: number;
  onClose?: () => void;
  showControls?: boolean;
  autoPlay?: boolean;
  interval?: number;
}

const Slider: React.FC<SliderProps> = ({
  items,
  initialIndex = 0,
  onClose,
  showControls = true,
  autoPlay = false,
  interval = 3000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  useEffect(() => {
    if (isPlaying && items.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, interval);
      return () => clearInterval(timer);
    }
  }, [isPlaying, items.length, interval]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
    setIsPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsPlaying(false);
  };

  if (items.length === 0) {
    return null;
  }

  const currentItem = items[currentIndex];

  return (
    <div className={styles.slider}>
      {onClose && (
        <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      )}
      
      <div className={styles.sliderContent}>
        {showControls && items.length > 1 && (
          <button
            className={styles.navButton}
            onClick={goToPrevious}
            aria-label="Предыдущий"
          >
            ‹
          </button>
        )}

        <div className={styles.slideContainer}>
          <div className={styles.slide}>
            {currentItem.type === 'image' && (
              <img
                src={currentItem.src}
                alt={currentItem.alt || ''}
                className={styles.slideImage}
              />
            )}
            {currentItem.type === 'video' && (
              <div className={styles.slideVideo}>
                <VideoPlayer
                  src={currentItem.src}
                  width="100%"
                  height="100%"
                />
              </div>
            )}
            {currentItem.type === 'audio' && (
              <div className={styles.slideAudio}>
                <AudioPlayer src={currentItem.src} theme="primary" />
              </div>
            )}
          </div>
          {currentItem.caption && (
            <div className={styles.caption}>{currentItem.caption}</div>
          )}
        </div>

        {showControls && items.length > 1 && (
          <button
            className={styles.navButton}
            onClick={goToNext}
            aria-label="Следующий"
          >
            ›
          </button>
        )}
      </div>

      {showControls && items.length > 1 && (
        <div className={styles.dots}>
          {items.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
            />
          ))}
        </div>
      )}

      {items.length > 1 && (
        <div className={styles.counter}>
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
};

export default Slider;



