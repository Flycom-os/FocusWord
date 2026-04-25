'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import { OutputData } from '@editorjs/editorjs'

// Import EditorJS dynamically to avoid SSR issues
const EditorJS = dynamic(() => import('@editorjs/editorjs'), { 
  ssr: false,
  loading: () => <div>Loading editor...</div>
})

interface SafeEditorProps {
  holder: string
  data?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
}

const SafeEditor: React.FC<SafeEditorProps> = ({ holder, data, onChange, placeholder }) => {
  const editorInstanceRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const initEditor = async () => {
      if (!containerRef.current || !isReady) return

      // Clear previous instance
      if (editorInstanceRef.current) {
        try {
          await editorInstanceRef.current.destroy()
        } catch (error) {
          console.warn('Error destroying editor instance:', error)
        }
        editorInstanceRef.current = null
      }

      // Import EditorJS dynamically
      const { default: EditorJSClass } = await import('@editorjs/editorjs')
      
      // Initialize editor
      const editor = new EditorJSClass({
        holder: containerRef.current,
        placeholder: placeholder || 'Начните писать...',
        data: data || {
          blocks: []
        },
        onChange: () => {
          if (editorInstanceRef.current) {
            const editorData = editorInstanceRef.current.save()
            onChange?.(editorData)
          }
        },
        autofocus: true,
        tools: {
          header: require('@editorjs/header'),
          list: require('@editorjs/list'),
          image: require('@editorjs/image'),
          embed: require('@editorjs/embed'),
          table: require('@editorjs/table'),
          code: require('@editorjs/code'),
          link: require('@editorjs/link'),
          delimiter: require('@editorjs/delimiter'),
          inlineCode: require('@editorjs/inline-code'),
          marker: require('@editorjs/marker'),
          warning: require('@editorjs/warning'),
          quote: require('@editorjs/blockquote'),
          checklist: require('@editorjs/checklist')
        }
      })

      editorInstanceRef.current = editor
      setIsReady(true)
    }

    initEditor()
  }, [holder, placeholder, data, onChange, isReady])

  useEffect(() => {
    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.destroy()
        editorInstanceRef.current = null
      }
    }
  }, [])

  // Update editor data when it changes externally
  useEffect(() => {
    if (editorInstanceRef.current && data && isReady) {
      editorInstance.current.render(data)
    }
  }, [data, isReady])

  return (
    <div ref={containerRef} className="editor-container">
      {!isReady && (
        <div className="editor-placeholder">
          {placeholder || 'Загрузка редактора...'}
        </div>
      )}
    </div>
  )
}

export default SafeEditor
