import { OutputBlockData } from "@editorjs/editorjs";
import { RecordDto } from "@/src/shared/api/records";

/** Видимые маркеры в markdown-редакторе (парсятся обратно в блоки). */
const MEDIA_LINE = /^\[\[media:([^|\]]+)\|([^\]]*)\]\]$/;
const SLIDER_LINE = /^\[\[slider:(\d+)\|([^|\]]*)\|([^\]]*)\]\]$/;
const WIDGET_LINE = /^\[\[widget:([^|\]]+)\|([^\]]*)\]\]$/;

/** Старый формат из редактора. */
const LEGACY_MEDIA = /^📷\s*Медиа:\s*(.+)$/i;
const LEGACY_SLIDER = /^🎠\s*Слайдер:\s*(.+)$/i;
const LEGACY_WIDGET = /^🧩\s*Виджет:\s*(.+)$/i;

const HTML_MEDIA = /<!--fw:media:(.*?)-->/;
const HTML_SLIDER = /<!--fw:slider:(.*?)-->/;
const HTML_WIDGET = /<!--fw:widget:(.*?)-->/;

export type RecordBlock = OutputBlockData & {
  data: Record<string, unknown>;
};

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function parseMediaData(raw: string, caption = ""): Record<string, unknown> {
  const filepath = raw.trim();
  const filename = filepath.split(/[/\\]/).pop() || filepath;
  return { filepath, url: filepath, filename, caption };
}

function blockFromMedia(data: Record<string, unknown>, id: string): RecordBlock {
  return { id, type: "media", data };
}

function blockFromSlider(data: Record<string, unknown>, id: string): RecordBlock {
  return {
    id,
    type: "slider",
    data: {
      sliderId: data.sliderId ?? data.id,
      id: data.sliderId ?? data.id,
      slug: data.slug,
      name: data.name,
      description: data.description,
    },
  };
}

function blockFromWidget(data: Record<string, unknown>, id: string): RecordBlock {
  return {
    id,
    type: "widget",
    data: {
      slug: data.slug,
      name: data.name,
    },
  };
}

/** Блоки → markdown для MD-редактора. */
export function blocksToMarkdown(blocks: RecordBlock[]): string {
  if (!blocks?.length) return "";

  return blocks
    .map((block) => {
      const d = block.data || {};
      switch (block.type) {
        case "header": {
          const level = Math.min(6, Math.max(1, Number(d.level) || 2));
          return `${"#".repeat(level)} ${d.text || ""}`;
        }
        case "list": {
          const items = (d.items as string[]) || [];
          if (d.style === "ordered") {
            return items.map((item, i) => `${i + 1}. ${item}`).join("\n");
          }
          return items.map((item) => `- ${item}`).join("\n");
        }
        case "image":
          return d.url ? `![${d.caption || ""}](${d.url})` : "";
        case "media": {
          const filepath = String(d.url || d.filepath || "");
          const filename = String(d.filename || filepath.split(/[/\\]/).pop() || "file");
          return `[[media:${filepath}|${filename}]]`;
        }
        case "slider": {
          const id = Number(d.sliderId ?? d.id) || 0;
          const slug = String(d.slug || "");
          const name = String(d.name || slug || "Слайдер");
          return `[[slider:${id}|${slug}|${name}]]`;
        }
        case "widget": {
          const slug = String(d.slug || "");
          const name = String(d.name || slug || "Виджет");
          return `[[widget:${slug}|${name}]]`;
        }
        case "paragraph":
        default:
          return String(d.text ?? "");
      }
    })
    .filter((line) => line.trim())
    .join("\n\n");
}

function tryParseMarkerLine(line: string): RecordBlock | null {
  const trimmed = line.trim();

  const htmlMedia = trimmed.match(HTML_MEDIA);
  if (htmlMedia) {
    try {
      const data = JSON.parse(htmlMedia[1]) as Record<string, unknown>;
      return blockFromMedia(
        parseMediaData(String(data.filepath || data.url || ""), String(data.caption || "")),
        `m-${Date.now()}`,
      );
    } catch {
      return null;
    }
  }

  const htmlSlider = trimmed.match(HTML_SLIDER);
  if (htmlSlider) {
    try {
      const data = JSON.parse(htmlSlider[1]) as Record<string, unknown>;
      return blockFromSlider(data, `s-${Date.now()}`);
    } catch {
      return null;
    }
  }

  const htmlWidget = trimmed.match(HTML_WIDGET);
  if (htmlWidget) {
    try {
      const data = JSON.parse(htmlWidget[1]) as Record<string, unknown>;
      return blockFromWidget(data, `w-${Date.now()}`);
    } catch {
      return null;
    }
  }

  const media = trimmed.match(MEDIA_LINE);
  if (media) {
    return blockFromMedia(parseMediaData(media[1], ""), `m-${Date.now()}`);
  }

  const slider = trimmed.match(SLIDER_LINE);
  if (slider) {
    return blockFromSlider(
      { sliderId: parseInt(slider[1], 10), slug: slider[2], name: slider[3] },
      `s-${Date.now()}`,
    );
  }

  const widget = trimmed.match(WIDGET_LINE);
  if (widget) {
    return blockFromWidget({ slug: widget[1], name: widget[2] }, `w-${Date.now()}`);
  }

  const legacyMedia = trimmed.match(LEGACY_MEDIA);
  if (legacyMedia) {
    const rest = legacyMedia[1].trim();
    const fileMatch = rest.match(
      /(\S+\.(?:png|jpe?g|gif|webp|svg|mp4|webm|ogg|mp3|wav|m4a|avi|mov))$/i,
    );
    const filepath = fileMatch ? fileMatch[1] : rest;
    return blockFromMedia(parseMediaData(filepath), `m-${Date.now()}`);
  }

  const legacySlider = trimmed.match(LEGACY_SLIDER);
  if (legacySlider) {
    const token = legacySlider[1].trim();
    return blockFromSlider({ slug: token, name: token }, `s-${Date.now()}`);
  }

  const legacyWidget = trimmed.match(LEGACY_WIDGET);
  if (legacyWidget) {
    const token = legacyWidget[1].trim();
    return blockFromWidget({ slug: token, name: token }, `w-${Date.now()}`);
  }

  return null;
}

/** Markdown из редактора → блоки (сохраняет media/slider/widget при правке текста). */
export function markdownToBlocks(markdown: string, keepBlocks?: RecordBlock[]): RecordBlock[] {
  if (!markdown?.trim()) {
    return (
      keepBlocks?.filter((b) => b.type === "media" || b.type === "slider" || b.type === "widget") ||
      []
    );
  }

  const result: RecordBlock[] = [];
  let textBuffer: string[] = [];

  const flushText = () => {
    const joined = textBuffer.join("\n").trim();
    textBuffer = [];
    if (!joined) return;

    splitParagraphs(joined).forEach((para) => {
      const marker = tryParseMarkerLine(para);
      if (marker) {
        result.push({ ...marker, id: `${marker.type}-${result.length}` });
        return;
      }
      if (para.startsWith("#")) {
        const match = para.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
          result.push({
            id: `h-${result.length}`,
            type: "header",
            data: { level: match[1].length, text: match[2] },
          });
          return;
        }
      }
      result.push({
        id: `p-${result.length}`,
        type: "paragraph",
        data: { text: para },
      });
    });
  };

  for (const line of markdown.split("\n")) {
    const marker = tryParseMarkerLine(line.trim());
    if (marker) {
      flushText();
      result.push({ ...marker, id: `${marker.type}-${result.length}` });
      continue;
    }
    if (!line.trim()) {
      flushText();
      continue;
    }
    textBuffer.push(line);
  }
  flushText();

  if (result.some((b) => b.type === "media" || b.type === "slider" || b.type === "widget")) {
    return result;
  }

  return result.length ? result : keepBlocks || [];
}

export function blocksFromRecord(record: RecordDto): RecordBlock[] {
  if (record.content) {
    try {
      const parsed = JSON.parse(record.content);
      if (Array.isArray(parsed)) {
        const blocks = parsed.map((block, index) => ({
          id: String(block.id ?? index),
          type: block.type,
          data: (block.data ?? block.config ?? {}) as Record<string, unknown>,
        })) as RecordBlock[];

        if (blocks.some((b) => b.type === "media" || b.type === "slider" || b.type === "widget")) {
          return blocks;
        }

        const onlyText = blocks.every((b) => b.type === "paragraph");
        if (onlyText) {
          const merged = blocks.map((b) => String(b.data?.text ?? "")).join("\n");
          const parsed = markdownToBlocks(merged);
          if (
            parsed.some((b) => b.type === "media" || b.type === "slider" || b.type === "widget")
          ) {
            return parsed;
          }
        }

        return blocks;
      }
    } catch {
      // markdown or plain text
    }

    if (
      record.content.includes("[[media:") ||
      record.content.includes("[[slider:") ||
      record.content.includes("[[widget:") ||
      record.content.includes("📷") ||
      record.content.includes("🎠") ||
      record.content.includes("🧩")
    ) {
      return markdownToBlocks(record.content);
    }
  }

  if (record.contentBlocks?.length) {
    return record.contentBlocks.map((block, index) => ({
      id: String(block.id ?? index),
      type: block.type,
      data: (block.config ?? {}) as Record<string, unknown>,
    })) as RecordBlock[];
  }

  if (record.content?.trim()) {
    return markdownToBlocks(record.content);
  }

  return [];
}

export function serializeRecordBlocks(blocks: RecordBlock[]): string {
  return JSON.stringify(blocks);
}
