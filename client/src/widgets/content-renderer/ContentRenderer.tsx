"use client";

import { useEffect, useState } from "react";
import { OutputBlockData } from "@editorjs/editorjs";
import MDEditor from "@uiw/react-md-editor";
import {
  getPublicSlider,
  getPublicSliderBySlug,
  getSlider,
  SliderDetailsDto,
} from "@/src/shared/api/sliders";
import { useAuth } from "@/src/app/providers/auth-provider";
import { PageSlider } from "@/src/shared/ui";
import { getMediaKind, getMediaUrl } from "@/src/shared/lib/media-url";
import { WidgetRenderer } from "../widget-renderer/WidgetRenderer";
import styles from "./ContentRenderer.module.css";

interface ContentRendererProps {
  blocks: OutputBlockData[];
  publicMode?: boolean;
}

const MediaBlockView = ({ data }: { data: Record<string, unknown> }) => {
  const url = getMediaUrl((data.filepath as string) || (data.url as string) || "");
  const filename = (data.filename as string) || "";
  const caption = (data.caption as string) || "";
  const kind = getMediaKind(filename, url);

  if (!url) {
    return null;
  }

  return (
    <figure className={styles.mediaFigure}>
      {kind === "video" && (
        <video controls className={styles.mediaVideo} preload="metadata">
          <source src={url} />
        </video>
      )}
      {kind === "audio" && (
        <audio controls className={styles.mediaAudio} preload="metadata">
          <source src={url} />
        </audio>
      )}
      {kind === "image" && (
        <img src={url} alt={caption || filename || "Media"} className={styles.mediaImage} />
      )}
      {kind === "file" && (
        <a href={url} className={styles.mediaFileLink} target="_blank" rel="noopener noreferrer">
          {filename || "Download File"}
        </a>
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

const SliderBlockComponent = ({
  sliderId,
  sliderSlug,
  publicMode,
}: {
  sliderId?: number;
  sliderSlug?: string;
  publicMode?: boolean;
}) => {
  const { accessToken } = useAuth();
  const [slider, setSlider] = useState<SliderDetailsDto | null>(null);

  useEffect(() => {
    const loadSlider = async () => {
      try {
        if (publicMode) {
          if (sliderId) {
            setSlider(await getPublicSlider(Number(sliderId)));
          } else if (sliderSlug) {
            setSlider(await getPublicSliderBySlug(sliderSlug));
          }
          return;
        }
        if (accessToken && sliderId) {
          setSlider(await getSlider(accessToken, sliderId));
        }
      } catch (error) {
        console.error("Failed to load slider", error);
      }
    };
    loadSlider();
  }, [accessToken, sliderId, sliderSlug, publicMode]);

  if (!slider) {
    return <div className={styles.sliderPlaceholder}>Загрузка слайдера...</div>;
  }

  const sanitizedSlider = {
    ...slider,
    description: slider.description || undefined,
    slides: slider.slides?.map((s) => ({
      ...s,
      title: s.title || undefined,
      description: s.description || undefined,
      linkUrl: s.linkUrl || undefined,
      image: s.image || undefined,
    })),
  };

  return <PageSlider slider={sanitizedSlider as any} autoPlay showArrows showDots />;
};

export const ContentRenderer = ({ blocks, publicMode = false }: ContentRendererProps) => {
  if (!blocks?.length) {
    return null;
  }

  return (
    <div className={styles.contentRoot} data-color-mode="light">
      {blocks.map((block, index) => {
        const data = (block.data || {}) as Record<string, unknown>;

        switch (block.type) {
          case "header": {
            const Tag = `h${data.level || 2}` as keyof JSX.IntrinsicElements;
            return (
              <Tag key={index} className={styles.blockHeader}>
                <MDEditor.Markdown source={String(data.text || "")} />
              </Tag>
            );
          }
          case "paragraph":
            return (
              <div key={index} className={styles.blockParagraph}>
                <MDEditor.Markdown source={String(data.text || "")} />
              </div>
            );
          case "list": {
            const ListTag = data.style === "ordered" ? "ol" : "ul";
            const items = (data.items as string[]) || [];
            return (
              <ListTag key={index} className={styles.blockList}>
                {items.map((item, i) => (
                  <li key={i}>
                    <MDEditor.Markdown source={item} />
                  </li>
                ))}
              </ListTag>
            );
          }
          case "image":
            return (
              <figure key={index} className={styles.mediaFigure}>
                <img
                  src={getMediaUrl(data.url as string)}
                  alt={(data.caption as string) || ""}
                  className={styles.mediaImage}
                />
                {!!data.caption && <figcaption>{String(data.caption)}</figcaption>}
              </figure>
            );
          case "media":
            return <MediaBlockView key={index} data={data} />;
          case "slider":
            return (
              <div key={index} className={styles.sliderWrapper}>
                <SliderBlockComponent
                  sliderId={data.sliderId as number | undefined}
                  sliderSlug={(data.slug as string) || undefined}
                  publicMode={publicMode}
                />
              </div>
            );
          case "embed":
            return (
              <div key={index} className={styles.embedWrapper}>
                <iframe
                  title="embed"
                  width="100%"
                  height="400"
                  src={String(data.embed || "")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            );
          case "table":
            const tableContent = (data.content as string[][]) || [];
            const withHeadings = !!data.withHeadings; // Ensure it's a boolean

            return (
              <table key={index} className={styles.table}>
                <tbody>
                  {tableContent.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) =>
                        withHeadings && i === 0 ? (
                          <th key={j}>
                            <MDEditor.Markdown source={cell} />
                          </th>
                        ) : (
                          <td key={j}>
                            <MDEditor.Markdown source={cell} />
                          </td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            );
          case "raw":
            return (
              <div
                key={index}
                className={styles.rawHtml}
                dangerouslySetInnerHTML={{ __html: String(data.html || "") }}
              />
            );
          case "widget":
            return (
              <div key={index} className={styles.widgetWrapper}>
                <WidgetRenderer slug={data.slug as string} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};
