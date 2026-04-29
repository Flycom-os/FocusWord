import React, { useRef, useState, useEffect } from 'react';
import styles from './ui-audio.module.css';

export interface AudioPlayerProps {
  src: string;
  theme?: 'primary' | 'secondary';
}

const AudioPlayer = ({ src, theme = 'primary' }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress((a.currentTime / (a.duration || 1)) * 100);
    a.addEventListener('timeupdate', onTime);
    return () => a.removeEventListener('timeupdate', onTime);
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.play();
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * a.duration;
    
    a.currentTime = newTime;
  };

  return (
    <div className={`${styles.player} ${styles[theme]}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className={styles.play}>
        {playing ? '❚❚' : '▶'}
      </button>
      <div className={styles.progressWrap} onClick={seek}>
        <div className={styles.progress} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
};

export default AudioPlayer;
