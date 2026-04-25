'use client'

import { useState, useEffect } from 'react'
import { OutputData } from '@editorjs/editorjs'

interface BasicEditorProps {
  holder: string
  data?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
}

const BasicEditor: React.FC<BasicEditorProps> = ({ holder, data, onChange, placeholder }) => {
  const [editorContent, setEditorContent] = useState('')

  // Load existing data when component mounts or data changes
  useEffect(() => {
    if (data && data.blocks && data.blocks.length > 0) {
      console.log('Loading editor data:', data);
      // Extract text from different block types
      const textParts = data.blocks.map(block => {
        switch (block.type) {
          case 'paragraph':
            return block.data?.text || '';
          case 'header':
            return `# ${block.data?.text || ''}`;
          case 'list':
            if (Array.isArray(block.data?.items)) {
              return block.data.items.map((item: string) => `• ${item}`).join('\n');
            }
            return '';
          case 'image':
            return `[Image: ${block.data?.caption || 'No caption'}]`;
          case 'embed':
            return `[Embed: ${block.data?.url || 'No URL'}]`;
          default:
            // Try to extract text or show block type
            if (block.data?.text) return block.data.text;
            if (block.data?.url) return `[${block.type}: ${block.data.url}]`;
            if (block.data?.caption) return `[${block.type}: ${block.data.caption}]`;
            return ''; // Skip complex blocks
        }
      }).filter(text => text && text.trim());
      
      const content = textParts.join('\n\n');
      console.log('Setting editor content:', content);
      setEditorContent(content);
    }
  }, [data])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setEditorContent(content)
    
    // Convert text to OutputData format
    const lines = content.split('\n').filter(line => line.trim())
    const blocks = lines.map(line => ({
      id: Date.now().toString() + Math.random().toString(36),
      type: 'paragraph',
      data: {
        text: line.trim()
      }
    }))

    onChange?.({
      blocks: blocks.length > 0 ? blocks : [{
        id: Date.now().toString(),
        type: 'paragraph',
        data: {
          text: ''
        }
      }]
    })
  }

  return (
    <div>
      <textarea
        id={holder}
        value={editorContent}
        onChange={handleContentChange}
        placeholder={placeholder || 'Начните писать контент страницы здесь...'}
        style={{
          width: '100%',
          minHeight: '400px',
          padding: '16px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontFamily: 'inherit',
          fontSize: '14px',
          lineHeight: '1.5',
          resize: 'vertical',
          outline: 'none'
        }}
      />
    </div>
  )
}

export default BasicEditor
