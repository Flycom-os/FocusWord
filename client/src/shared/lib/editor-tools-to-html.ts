import { OutputBlockData } from '@editorjs/editorjs';

export const editorToolsToHtml = (blocks: OutputBlockData[]): string => {
  let html = '';
  for (const block of blocks) {
    switch (block.type) {
      case 'header':
        html += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
        break;
      case 'paragraph':
        html += `<p>${block.data.text}</p>`;
        break;
      case 'list':
        const listStyle = block.data.style === 'ordered' ? 'ol' : 'ul';
        html += `<${listStyle}>`;
        for (const item of block.data.items) {
          html += `<li>${item}</li>`;
        }
        html += `</${listStyle}>`;
        break;
      case 'embed':
        html += `<iframe width="100%" height="315" src="${block.data.embed}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
        break;
      case 'table':
        html += '<table>';
        for (const row of block.data.content) {
          html += '<tr>';
          for (const cell of row) {
            html += `<td>${cell}</td>`;
          }
          html += '</tr>';
        }
        html += '</table>';
        break;
      case 'raw':
        html += block.data.html;
        break;
      case 'media':
        const mediaUrl = block.data.url.startsWith('http') ? block.data.url : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331"}/backend/uploads/${block.data.url}`;
        html += `<figure><img src="${mediaUrl}" alt="${block.data.caption || ''}" /><figcaption>${block.data.caption || ''}</figcaption></figure>`;
        break;
      case 'slider':
        html += `<div style="border: 2px dashed #ccc; padding: 20px; text-align: center; margin: 20px 0;">[Slider: ID ${block.data.sliderId}]</div>`;
        break;
      // Add other block types here as you add them to the editor
      default:
        // Fallback for unknown block types
        console.warn(`Unknown block type: ${block.type}`);
        html += `<p>${JSON.stringify(block.data)}</p>`;
        break;
    }
  }
  return html;
};
