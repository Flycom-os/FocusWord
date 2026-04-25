'use client'

import { useEffect, useRef, useState } from 'react'
import { OutputData } from '@editorjs/editorjs'

interface SimpleEditorProps {
  holder: string
  data?: OutputData
  onChange?: (data: OutputData) => void
  placeholder?: string
}

const SimpleEditor: React.FC<SimpleEditorProps> = ({ holder, data, onChange, placeholder }) => {
  const editorInstanceRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [EditorJS, setEditorJS] = useState<any>(null)

  useEffect(() => {
    // Import EditorJS only on client side
    if (typeof window !== 'undefined') {
      import('@editorjs/editorjs').then(({ default: EditorJSClass }) => {
        setEditorJS(() => EditorJSClass)
      })
    }
  }, [])

  useEffect(() => {
    if (!EditorJS || !containerRef.current || !isReady) return

    const initEditor = async () => {
      // Clear previous instance
      if (editorInstanceRef.current) {
        try {
          await editorInstanceRef.current.destroy()
        } catch (error) {
          console.warn('Error destroying editor instance:', error)
        }
        editorInstanceRef.current = null
      }

      try {
        const editor = new EditorJS({
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
            header: {
              class: require('@editorjs/header'),
              inlineToolbar: true,
              shortcut: 'CMD+SHIFT+H'
            },
            list: {
              class: require('@editorjs/list'),
              inlineToolbar: false
            },
            image: {
              class: require('@editorjs/image'),
              inlineToolbar: true,
              config: {
                embed: {
                  enabled: true
                }
              }
            },
            embed: {
              class: require('@editorjs/embed'),
              inlineToolbar: true,
              config: {
                services: {
                  youtube: true,
                  vimeo: true
                }
              }
            },
            table: {
              class: require('@editorjs/table'),
              inlineToolbar: true
            },
            code: {
              class: require('@editorjs/code'),
              inlineToolbar: true
            },
            link: {
              class: require('@editorjs/link'),
              inlineToolbar: true
            },
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
      } catch (error) {
        console.error('Error initializing EditorJS:', error)
        setIsReady(true) // Still mark as ready to show error message
      }
    }

    initEditor()
  }, [EditorJS, holder, placeholder, data, onChange, isReady])

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
      try {
        editorInstanceRef.current.render(data)
      } catch (error) {
        console.error('Error updating editor data:', error)
      }
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

export default SimpleEditor
