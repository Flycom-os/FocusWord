import React, { useRef, useState, useEffect } from 'react';
import styles from './ui-video.module.css';

export interface VideoPlayerProps {
  src: string;
  width?: number | string;
  height?: number | string;
}

const VideoPlayer = ({ src, width = '480px', height = '270px' }: VideoPlayerProps) => {
  const ref = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const onTime = () => setProgress((v.currentTime / (v.duration || 1)) * 100);
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (playing) {
      v.pause();
      setPlaying(false);
    } else {
      v.play();
      setPlaying(true);
    }
  };

  return (
    <div className={styles.videoWrap} style={{ width }}>
      <video ref={ref} src={src} width={width} height={height} style={{ display: 'block', borderRadius: 8 }} />
      <div className={styles.controls}>
        <button onClick={toggle} className={styles.play} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? '❚❚' : '▶'}
        </button>
        <div className={styles.progressWrap}>
          <div className={styles.progress} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
