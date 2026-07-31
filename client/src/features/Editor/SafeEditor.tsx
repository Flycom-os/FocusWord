"use client";

import { useEffect, useRef, useState } from "react";
import { OutputData } from "@editorjs/editorjs";

interface SafeEditorProps {
  holder: string;
  data?: OutputData;
  onChange?: (data: OutputData) => void;
  placeholder?: string;
}

const SafeEditor: React.FC<SafeEditorProps> = ({ holder, data, onChange, placeholder }) => {
  const editorInstanceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    const initEditor = async () => {
      if (!containerRef.current) return;

      // Clear previous instance
      if (editorInstanceRef.current) {
        try {
          await editorInstanceRef.current.destroy();
        } catch (error) {
          console.warn("Error destroying editor instance:", error);
        }
        editorInstanceRef.current = null;
      }

      // Import EditorJS dynamically
      const { default: EditorJSClass } = await import("@editorjs/editorjs");

      if (!active) return;

      // Initialize editor
      const editor = new EditorJSClass({
        holder: containerRef.current,
        placeholder: placeholder || "Start writing...",
        data: data || {
          blocks: [],
        },
        onChange: () => {
          if (editorInstanceRef.current) {
            editorInstanceRef.current.save().then((editorData: any) => {
              onChange?.(editorData);
            });
          }
        },
        autofocus: true,
        tools: {
          header: require("@editorjs/header"),
          list: require("@editorjs/list"),
          image: require("@editorjs/image"),
          embed: require("@editorjs/embed"),
          table: require("@editorjs/table"),
          code: require("@editorjs/code"),
          link: require("@editorjs/link"),
          delimiter: require("@editorjs/delimiter"),
          inlineCode: require("@editorjs/inline-code"),
          marker: require("@editorjs/marker"),
          warning: require("@editorjs/warning"),
          quote: require("@editorjs/blockquote"),
          checklist: require("@editorjs/checklist"),
        },
      });

      editorInstanceRef.current = editor;
      setIsReady(true);
    };

    initEditor();

    return () => {
      active = false;
    };
  }, [holder, placeholder]);

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy();
        editorInstanceRef.current = null;
      }
    };
  }, []);

  // Update editor data when it changes externally
  useEffect(() => {
    if (editorInstanceRef.current && data && isReady) {
      // Check if data is different before rendering to avoid cursor jumping
      editorInstanceRef.current.render(data);
    }
  }, [data, isReady]);

  return (
    <div ref={containerRef} className="editor-container">
      {!isReady && (
        <div className="editor-placeholder">{placeholder || "Loading editor..."}</div>
      )}
    </div>
  );
};

export default SafeEditor;
