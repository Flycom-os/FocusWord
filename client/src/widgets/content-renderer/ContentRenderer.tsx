'use client';

import { useEffect, useState } from 'react';
import { OutputBlockData } from '@editorjs/editorjs';
import { getSlider, SliderDetailsDto } from '@/src/shared/api/sliders';
import { PageSlider } from '@/src/shared/ui';
import { useAuth } from '@/src/app/providers/auth-provider';
import styles from './ContentRenderer.module.css';

interface ContentRendererProps {
  blocks: OutputBlockData[];
}

const getFileUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url;
  }
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
  return `${API_URL}/backend/uploads/${url}`;
};

const SliderBlockComponent = ({ sliderId }: { sliderId: number }) => {
  const { accessToken } = useAuth();
  const [slider, setSlider] = useState<SliderDetailsDto | null>(null);

  useEffect(() => {
    const loadSlider = async () => {
      try {
        const sliderData = await getSlider(accessToken, sliderId);
        setSlider(sliderData);
      } catch (error) {
        console.error(`Failed to load slider with ID ${sliderId}`, error);
      }
    };
    if (accessToken) {
      loadSlider();
    }
  }, [accessToken, sliderId]);

  if (!slider) {
    return <div className={styles.sliderPlaceholder}>Loading slider...</div>;
  }

  return <PageSlider slider={slider} autoPlay showArrows showDots />;
};

export const ContentRenderer = ({ blocks }: ContentRendererProps) => {
  if (!blocks || !Array.isArray(blocks)) {
    return null;
  }

  return (
    <div className="prose prose-lg max-w-none">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'header':
            const Tag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
            return <Tag key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
          case 'paragraph':
            return <p key={index} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            return (
              <ListTag key={index}>
                {block.data.items.map((item: string, i: number) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            );
          case 'media':
            return (
              <figure key={index} className={styles.mediaFigure}>
                <img src={getFileUrl(block.data.url)} alt={block.data.caption || 'Media content'} className={styles.mediaImage} />
                {block.data.caption && <figcaption>{block.data.caption}</figcaption>}
              </figure>
            );
          case 'slider':
            return (
              <div key={index} className={styles.sliderWrapper}>
                <SliderBlockComponent sliderId={block.data.sliderId} />
              </div>
            );
          case 'embed':
            return (
              <div key={index} className={styles.embedWrapper}>
                <iframe
                  width="100%"
                  height="315"
                  src={block.data.embed}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            );
          case 'table':
            return (
              <table key={index} className={styles.table}>
                <tbody>
                  {block.data.content.map((row: string[], i: number) => (
                    <tr key={i}>
                      {row.map((cell: string, j: number) => (
                        <td key={j} dangerouslySetInnerHTML={{ __html: cell }} />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case 'raw':
             return <div key={index} dangerouslySetInnerHTML={{ __html: block.data.html }} />;
          default:
            console.warn(`Unhandled block type: ${block.type}`);
            return null;
        }
      })}
    </div>
  );
};
