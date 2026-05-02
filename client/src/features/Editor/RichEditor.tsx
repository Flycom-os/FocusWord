'use client';

import { useState, useEffect } from 'react';
import { OutputData } from '@editorjs/editorjs';
import Editor from './ui/Editor';

interface RichEditorProps {
  holder: string;
  data?: OutputData;
  onChange: (data: OutputData) => void;
  placeholder?: string;
  onMediaSelect?: () => void;
  onSliderSelect?: () => void;
}

const RichEditor: React.FC<RichEditorProps> = ({ 
  holder, 
  data, 
  onChange, 
  placeholder,
  onMediaSelect,
  onSliderSelect 
}) => {
  const [editorData, setEditorData] = useState<OutputData>(data || { blocks: [] });

  useEffect(() => {
    if (data) {
      setEditorData(data);
    }
  }, [data]);

  const handleChange = (newData: OutputData) => {
    setEditorData(newData);
    onChange(newData);
  };

  return (
    <div>
      {onMediaSelect || onSliderSelect ? (
        <div className="mb-2 flex gap-2">
          {onMediaSelect && (
            <button
              type="button"
              onClick={onMediaSelect}
              className="px-3 py-1 text-sm border bg-white rounded hover:bg-gray-100"
              title="Добавить медиафайл"
            >
              📷 Медиа
            </button>
          )}
          {onSliderSelect && (
            <button
              type="button"
              onClick={onSliderSelect}
              className="px-3 py-1 text-sm border bg-white rounded hover:bg-gray-100"
              title="Добавить слайдер"
            >
              🎠 Слайдер
            </button>
          )}
        </div>
      ) : null}
      <Editor
        data={editorData}
        onChange={handleChange}
        holder={holder}
      />
    </div>
  );
};

export default RichEditor;
