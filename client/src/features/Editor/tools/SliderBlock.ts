import { API, BlockTool, BlockToolData } from '@editorjs/editorjs';
import { fetchSliders, SliderDto } from '@/src/shared/api/sliders';
import { useAuth } from '@/src/app/providers/auth-provider';

class SliderBlock {
    private api: API;
    private data: BlockToolData & { sliderId?: number };
    private wrapper: HTMLElement | undefined;
    private select: HTMLSelectElement | undefined;

    constructor({ data, api }: { data: BlockToolData & { sliderId?: number }; api: API }) {
        this.api = api;
        this.data = data || {};
        this.wrapper = undefined;
    }

    static get toolbox() {
        return {
            title: 'Slider',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-film"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>'
        };
    }

    async render(): Promise<HTMLElement> {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('slider-block');

        this.select = document.createElement('select');
        this.select.style.width = '100%';
        this.select.style.padding = '8px';

        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.innerText = 'Select a Slider...';
        placeholder.disabled = true;
        this.select.appendChild(placeholder);

        this.wrapper.appendChild(this.select);

        // Fetch sliders and populate the dropdown
        // This is a simplified example. In a real app, you would handle auth and errors.
        try {
            // This is a hacky way to get the token, not recommended for production
            const token = (window as any).accessToken; 
            const slidersResponse = await fetchSliders(token, { page: 1, limit: 100 });
            slidersResponse.data.forEach((slider: SliderDto) => {
                const option = document.createElement('option');
                option.value = slider.id.toString();
                option.innerText = slider.name;
                if (this.data.sliderId === slider.id) {
                    option.selected = true;
                }
                this.select?.appendChild(option);
            });
        } catch (e) {
            console.error('Failed to load sliders for SliderBlock', e);
            const errorEl = document.createElement('div');
            errorEl.innerText = 'Could not load sliders.';
            errorEl.style.color = 'red';
            this.wrapper.appendChild(errorEl);
        }
        
        this.select.value = this.data.sliderId?.toString() || '';
        if(!this.select.value) {
            placeholder.selected = true;
        }

        return this.wrapper;
    }

    save(blockContent: HTMLElement) {
        const select = blockContent.querySelector('select');
        if (select) {
            this.data.sliderId = parseInt(select.value, 10);
        }
        return this.data;
    }
}

export default SliderBlock;
