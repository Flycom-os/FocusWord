import { API, BlockTool, BlockToolData } from '@editorjs/editorjs';

class MediaBlock {
    private api: API;
    private data: BlockToolData;
    private wrapper: HTMLElement | undefined;

    constructor({ data, api }: { data: BlockToolData; api: API }) {
        this.api = api;
        this.data = data || {};
        this.wrapper = undefined;
    }

    static get toolbox() {
        return {
            title: 'Media',
            icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 56-29 42 30v0zM79 244h178c19 0 34-15 34-34v-3l-42-30-56 29-81-72-67 44v42c0 19 15 34 34 34z"/></svg>'
        };
    }

    render(): HTMLElement {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('media-block');

        if (this.data && this.data.url) {
            this._createImage(this.data.url, this.data.caption);
        } else {
            const button = document.createElement('button');
            button.innerHTML = 'Select Media';
            button.onclick = () => {
                // This is the tricky part. We need to open the React Modal here.
                // We'll dispatch a custom event that the React part of our app can listen to.
                window.dispatchEvent(new CustomEvent('open-media-picker', { 
                    detail: {
                        onSelect: (media: any) => {
                            this.data = { url: media.filepath, caption: media.caption, id: media.id };
                            if (this.wrapper) {
                                this.wrapper.innerHTML = '';
                                this._createImage(media.filepath, media.caption);
                            }
                        }
                    } 
                }));
            };
            this.wrapper.appendChild(button);
        }

        return this.wrapper;
    }
    
    _createImage(url: string, captionText: string) {
        const image = document.createElement('img');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1331";
        image.src = url.startsWith('http') ? url : `${API_URL}/backend/uploads/${url}`;

        const caption = document.createElement('input');
        caption.placeholder = 'Caption...';
        caption.value = captionText || '';
        caption.onchange = (e) => {
            this.data.caption = (e.target as HTMLInputElement).value;
        };
        this.wrapper?.appendChild(image);
        this.wrapper?.appendChild(caption);
    }

    save(blockContent: HTMLElement) {
        const image = blockContent.querySelector('img');
        const caption = blockContent.querySelector('input');
        
        if (image) {
            // The URL might be a full URL, we want to save the relative path
            const url = new URL(image.src);
            this.data.url = url.pathname.replace('/backend/uploads/', '');
        }

        if (caption) {
            this.data.caption = caption.value;
        }

        return this.data;
    }
}

export default MediaBlock;
