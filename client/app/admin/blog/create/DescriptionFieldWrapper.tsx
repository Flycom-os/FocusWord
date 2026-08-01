"use client";

import React from "react";
import { Image as ImageIcon, Presentation, Box } from "lucide-react";
import dynamic from "next/dynamic";
import { useTheme } from "@/src/shared/ui/DescriptionField/use-Theme";
import MarkdownRenderer from "@/src/shared/ui/DescriptionField/MarkdownRenderer";
import { cn } from "@/src/shared/ui/DescriptionField/utils";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

type Props = {
  value: string;
  onChange: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
  onMediaSelect?: () => void;
  onSliderSelect?: () => void;
  onWidgetSelect?: () => void;
  convertJsonToMarkdown?: (jsonValue: string) => string;
};

const DescriptionFieldWrapper: React.FC<Props> = ({
  value,
  onChange,
  isReadOnly = false,
  placeholder,
  label = "SEO Description",
  id,
  className,
  onMediaSelect,
  onSliderSelect,
  onWidgetSelect,
  convertJsonToMarkdown,
}) => {
  const { theme } = useTheme();

  // Use the passed conversion function or the default one
  const defaultConvertToMarkdown = (jsonValue: string): string => {
    if (!jsonValue) return "";

    try {
      const blocks = JSON.parse(jsonValue);
      if (!Array.isArray(blocks)) return jsonValue;

      return blocks
        .map((block) => {
          switch (block.type) {
            case "paragraph":
              return block.data?.text || "";
            case "header":
              const level = block.data?.level || 1;
              const headerText = block.data?.text || "";
              return `${"#".repeat(level)} ${headerText}`;
            case "list":
              if (Array.isArray(block.data?.items)) {
                const items = block.data.items.filter((item: string) => item.trim());
                if (block.data?.style === "ordered") {
                  return items
                    .map((item: string, index: number) => `${index + 1}. ${item}`)
                    .join("\n");
                }
                return items.map((item: string) => `- ${item}`).join("\n");
              }
              return "";
            case "image":
              if (block.data?.url) {
                const caption = block.data?.caption || "";
                return `![${caption}](${block.data.url})`;
              }
              return "";
            case "media":
              return `[Media]: ${block.data?.filename || "No name"}`;
            case "slider":
              return `[Slider]: ${block.data?.name || "No name"}`;
            case "widget":
              return `[Widget]: ${block.data?.name || block.data?.slug || "No name"}`;
            default:
              return "";
          }
        })
        .filter((text) => text.trim())
        .join("\n\n");
    } catch (e) {
      // If not JSON, return as is
      return jsonValue;
    }
  };

  const convertFunction = convertJsonToMarkdown || defaultConvertToMarkdown;

  return (
    <div className={cn("w-full flex flex-col sm:flex-row", className)}>
      <label className="w-[160px] my-2 lg:my-[0] font-medium">{label}</label>
      <div className="flex-1 flex-col">
        {onMediaSelect || onSliderSelect || onWidgetSelect ? (
          <div className="mb-2 flex gap-2">
            {onMediaSelect && (
              <button
                type="button"
                onClick={onMediaSelect}
                className="px-3 py-1 text-sm border bg-white rounded hover:bg-gray-100 inline-flex items-center gap-1.5"
                title="Add media file"
              >
                <ImageIcon size={14} /> Media
              </button>
            )}
            {onSliderSelect && (
              <button
                type="button"
                onClick={onSliderSelect}
                className="px-3 py-1 text-sm border bg-white rounded hover:bg-gray-100 inline-flex items-center gap-1.5"
                title="Add slider"
              >
                <Presentation size={14} /> Slider
              </button>
            )}
            {onWidgetSelect && (
              <button
                type="button"
                onClick={onWidgetSelect}
                className="px-3 py-1 text-sm border bg-white rounded hover:bg-gray-100 inline-flex items-center gap-1.5"
                title="Add widget"
              >
                <Box size={14} /> Widget
              </button>
            )}
          </div>
        ) : null}
        <div
          data-color-mode={theme === "dark" ? "dark" : "light"}
          className={cn(
            "md-field rounded-md overflow-hidden border",
            isReadOnly &&
              "border-disable-bg-border text-disable-typo dark:text-disable-bg-border bg-[#00203312] dark:bg-disable-bg",
          )}
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
                .md-field .wmde-preview, .md-field .wmde-markdown, .md-field .wmde-preview-content,
                .md-field .wmde-editor, .md-field .wmde-textarea, .md-field textarea,
                .md-field pre, .md-field code {
                  background: transparent !important;
                  background-color: transparent !important;
                  color: inherit !important;
                }

                .md-field .wmde-header, .md-field .wmde-toolbar, .md-field .wmde-toolbar-list {
                  background: transparent !important;
                  background-color: transparent !important;
                }

                .md-field .w-md-editor-text .w-md-editor-text-pre .language-markdown.code-highlight span {
                  font-size: 14px;
                  font-family: Montserrat, sans-serif;
                  line-height: 1.5;
                }
                
                .md-field .w-md-editor-text textarea {
                  font-size: 14px !important;
                  font-family: Montserrat, sans-serif !important;
                  line-height: 1.5 !important;
                }

                .md-field .wmde-markdown {
                  font-size: 14px;
                  font-family: Montserrat, sans-serif;
                  line-height: 1.5;
                }

                .w-md-editor-preview ul {
                  list-style-type: disc !important;
                  padding-left: 1.25rem !important; 
                }

                .w-md-editor-preview ol {
                  list-style-type: decimal !important;
                  padding-left: 1.25rem !important;
                }
              `,
            }}
          />

          {isReadOnly ? (
            <MarkdownRenderer
              content={convertFunction(value) || ""}
              className="p-4 prose dark:prose-invert max-w-none text-[14px] font-mono list-disc list-inside"
            />
          ) : (
            <MDEditor
              value={convertFunction(value) || ""}
              onChange={(val) => onChange(val ?? "")}
              height={200}
              maxHeight={400}
              className="!w-full dark:bg-zinc-900 font-normal font-montserrat "
              textareaProps={{
                id,
                placeholder: placeholder ?? "Enter description in Markdown...",
                style: {
                  height: 200,
                  width: "100%",
                  maxHeight: 400,
                  listStyleType: "disc",
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DescriptionFieldWrapper;
