'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from './form';
import { useTheme } from './use-Theme';
import MarkdownRenderer from './MarkdownRenderer';
import { cn } from './utils';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

type Props = {
  form: UseFormReturn<any>;
  name: string;
  isReadOnly?: boolean;
  placeholder?: string;
  label?: string;
  id?: string;
};

const DescriptionField: React.FC<Props> = ({
                                             form,
                                             name,
                                             isReadOnly = false,
                                             placeholder,
                                             label,
                                             id,
                                           }) => {
  const { theme } = useTheme();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full flex flex-col sm:flex-row">
          <FormLabel>{label ?? 'Description'}</FormLabel>
          <FormControl>
            <div
              data-color-mode={theme === 'dark' ? 'dark' : 'light'}
              className={cn(
                'md-field rounded-md overflow-hidden border',
                isReadOnly &&
                'border-disable-bg-border text-disable-typo dark:text-disable-bg-border bg-[#00203312] dark:bg-disable-bg'
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
                  content={field.value || ''}
                  className="p-4 prose dark:prose-invert max-w-none text-[14px] font-mono list-disc list-inside"
                />
              ) : (
                <MDEditor
                  value={field.value || ''}
                  onChange={(val) => field.onChange(val ?? '')}
                  height={200}
                  maxHeight={400}
                  className="!w-full dark:bg-zinc-900 font-normal font-montserrat "
                  textareaProps={{
                    id,
                    placeholder:
                      placeholder ?? 'Enter description in Markdown...',
                    style: {
                      height: 200,
                      width: '100%',
                      maxHeight: 400,
                      listStyleType: 'disc',
                    },
                  }}
                />
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default DescriptionField;
