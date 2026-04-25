'use client';
import React, { memo, useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';

// Define the types for the tools dynamically to avoid TS errors with require
type EditorTools = {
    [toolName: string]: any;
};

// It's better to require the tools inside the component to ensure they are only loaded on the client-side.
import MediaBlock from '../tools/MediaBlock';
import SliderBlock from '../tools/SliderBlock';

const EDITOR_TOOLS: EditorTools = {
    header: require('@editorjs/header'),
    list: require('@editorjs/list'),
    paragraph: require('@editorjs/paragraph'),
    embed: require('@editorjs/embed'),
    table: require('@editorjs/table'),
    raw: require('@editorjs/raw'),
    media: MediaBlock,
    slider: SliderBlock,
};

type EditorProps = {
    data?: OutputData;
    onChange: (data: OutputData) => void;
    holder: string;
};

const Editor = ({ data, onChange, holder }: EditorProps) => {
    // Add a reference to the editor
    const ref = useRef<EditorJS | null>(null);

    // Initialize editor
    useEffect(() => {
        // Initialize editor if we don't have a reference
        if (!ref.current) {
            const editor = new EditorJS({
                holder: holder,
                tools: EDITOR_TOOLS,
                data: data,
                async onChange(api, event) {
                    const savedData = await api.saver.save();
                    onChange(savedData);
                },
            });
            ref.current = editor;
        }

        // Add a cleanup function
        return () => {
            if (ref.current && ref.current.destroy) {
                ref.current.destroy();
                ref.current = null;
            }
        };
    }, []);

    return <div id={holder} className="prose" />;
};

export default memo(Editor);
