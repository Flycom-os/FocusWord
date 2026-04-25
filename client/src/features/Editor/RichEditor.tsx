'use client'

import { useState, useEffect, useRef } from 'react'
import { OutputData } from '@editorjs/editorjs'

interface RichEditorProps {
  holder: string
  data?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
  onMediaSelect?: () => void
  onSliderSelect?: () => void
}

const RichEditor: React.FC<RichEditorProps> = ({ holder, data, onChange, placeholder, onMediaSelect, onSliderSelect }) => {
  const [content, setContent] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  // Load existing data when component mounts or data changes
  useEffect(() => {
    if (data && data.blocks && data.blocks.length > 0) {
      const textParts = data.blocks.map(block => {
        switch (block.type) {
          case 'paragraph':
            return block.data?.text || '';
          case 'header':
            return `<h${block.data?.level || 1}>${block.data?.text || ''}</h${block.data?.level || 1}>`;
          case 'list':
            if (Array.isArray(block.data?.items)) {
              const tag = block.data?.style === 'ordered' ? 'ol' : 'ul';
              const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
              return `<${tag}>${items}</${tag}>`;
            }
            return '';
          case 'image':
            if (block.data?.url) {
              return `<img src="${block.data.url}" alt="${block.data?.caption || ''}" style="max-width: 100%; height: auto;" /><p><em>${block.data?.caption || ''}</em></p>`;
            }
            return `[Image: ${block.data?.caption || 'No image'}]`;
          case 'embed':
            if (block.data?.url) {
              return `<div class="embed-wrapper"><iframe src="${block.data.url}" style="max-width: 100%; height: 400px; border: 1px solid #ddd; border-radius: 8px;"></iframe></div>`;
            }
            return `[Embed: ${block.data?.url || 'No URL'}]`;
          case 'slider':
            return `[Slider: ${block.data?.name || 'No name'}]`;
          case 'media':
            return `[Media: ${block.data?.filename || 'No filename'}]`;
          default:
            return block.data?.text || '';
        }
      }).filter(text => text);
      
      const htmlContent = textParts.join('\n');
      setContent(htmlContent);
    }
  }, [data])

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setContent(html);
    
    // Convert HTML back to OutputData format
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const blocks = Array.from(doc.body.childNodes).map((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          return {
            id: Date.now().toString() + index,
            type: 'paragraph',
            data: { text }
          };
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        
        if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
          return {
            id: Date.now().toString() + index,
            type: 'header',
            data: {
              text: element.textContent || '',
              level: parseInt(element.tagName.charAt(1))
            }
          };
        } else if (element.tagName === 'P') {
          const text = element.textContent || '';
          // Если параграф пустой, пропускаем его
          if (!text.trim()) return null;
          return {
            id: Date.now().toString() + index,
            type: 'paragraph',
            data: { text }
          };
        } else if (element.tagName === 'UL' || element.tagName === 'OL') {
          const items = Array.from(element.children)
            .map(li => li.textContent?.trim() || '')
            .filter(text => text); // Фильтруем пустые элементы
          
          // Если список пустой, пропускаем его
          if (items.length === 0) return null;
          
          return {
            id: Date.now().toString() + index,
            type: 'list',
            data: {
              items,
              style: element.tagName === 'OL' ? 'ordered' : 'unordered'
            }
          };
        }
      }
      return null;
    }).filter((block): block is NonNullable<typeof block> => block !== null);

    onChange?.({
      blocks: blocks.length > 0 ? blocks : [{
        id: Date.now().toString(),
        type: 'paragraph',
        data: { text: '' }
      }]
    });
  }

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  }

  return (
    <div className="rich-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => execCommand('bold')} title="Жирный">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => execCommand('italic')} title="Курсив">
          <em>I</em>
        </button>
        <button type="button" onClick={() => execCommand('underline')} title="Подчеркнутый">
          <u>U</u>
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h1>')} title="Заголовок 1">
          H1
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h2>')} title="Заголовок 2">
          H2
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', '<h3>')} title="Заголовок 3">
          H3
        </button>
        <button type="button" onClick={() => execCommand('formatBlock', '<p>')} title="Параграф">
          P
        </button>
        <button type="button" onClick={() => execCommand('insertUnorderedList')} title="Список">
          •
        </button>
        <button type="button" onClick={() => execCommand('insertOrderedList')} title="Нумерованный список">
          1.
        </button>
        <button type="button" onClick={() => execCommand('justifyLeft')} title="По левому краю">
          ≡
        </button>
        <button type="button" onClick={() => execCommand('justifyCenter')} title="По центру">
          ≡
        </button>
        <button type="button" onClick={() => execCommand('justifyRight')} title="По правому краю">
          ≡
        </button>
        <div className="toolbar-separator"></div>
        <button type="button" onClick={onMediaSelect} title="Добавить медиафайл">
          📷
        </button>
        <button type="button" onClick={onSliderSelect} title="Добавить слайдер">
          🎠
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable={true}
        className="editor-content"
        onInput={handleContentChange}
        suppressContentEditableWarning={true}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <style jsx>{`
        .rich-editor {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          overflow: hidden;
        }
        .editor-toolbar {
          display: flex;
          gap: 2px;
          padding: 8px;
          background: #f9fafb;
          border-bottom: 1px solid #d1d5db;
          flex-wrap: wrap;
        }
        .editor-toolbar button {
          padding: 6px 10px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
        }
        .editor-toolbar button:hover {
          background: #f3f4f4;
        }
        .toolbar-separator {
          width: 1px;
          height: 24px;
          background: #d1d5db;
          margin: 0 8px;
        }
        .editor-content {
          min-height: 400px;
          padding: 16px;
          outline: none;
          line-height: 1.6;
        }
        .editor-content:focus {
          background: #fafafa;
        }
        .embed-wrapper {
          margin: 8px 0;
        }
        .embed-wrapper iframe {
          border: 1px solid #ddd;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}

export default RichEditor
