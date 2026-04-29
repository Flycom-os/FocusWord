'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from './use-Theme';

const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});

type MarkdownRendererProps = {
  content: string;
  fontSize?: string | number;
  className?: string;
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  fontSize,
  className = '',
}) => {
  const { theme } = useTheme();

  return (
    <div
      data-color-mode={theme === 'dark' ? 'dark' : 'light'}
      className={className}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .markdown-renderer .wmde-preview,
            .markdown-renderer .wmde-markdown,
            .markdown-renderer .wmde-preview-content,
            .markdown-renderer pre,
            .markdown-renderer code {
              background: transparent !important;
              background-color: transparent !important;
              color: inherit !important;
            }

            .markdown-renderer p,
            .markdown-renderer span,
            .markdown-renderer div {
              font-weight: normal !important;
            }

            .markdown-renderer strong,
            .markdown-renderer b {
              font-weight: bold !important;
            }

            .markdown-renderer {
              font-size: inherit;
            }

            .markdown-renderer h1,
            .markdown-renderer h2,
            .markdown-renderer h3,
            .markdown-renderer h4,
            .markdown-renderer h5,
            .markdown-renderer h6 {
              border-bottom: none !important;
              padding-bottom: 0 !important;
            }

						.markdown-renderer .wmde-markdown.wmde-markdown-color {
							font-family: Montserrat, sans-serif !important;
							font-size: ${fontSize ? (typeof fontSize === 'number' ? `${fontSize}px` : fontSize) : '16px'} !important;
						}

						.markdown-renderer ul,
						.markdown-renderer ol {
							margin: 0.5em 0 !important;
							padding-left: 1.5em !important;
							list-style-position: outside !important;
						}

						.markdown-renderer ul {
							list-style-type: disc !important;
						}

						.markdown-renderer ol {
							list-style-type: decimal !important;
						}

						.markdown-renderer li {
							display: list-item !important;
							margin: 0.25em 0 !important;
							line-height: 1.5 !important;
							padding: 0 !important;
						}
          `,
        }}
      />
      <div className="markdown-renderer">
        <MarkdownPreview
          source={content}
          style={{ background: 'transparent' }}
        />
      </div>
    </div>
  );
};

export default MarkdownRenderer;
