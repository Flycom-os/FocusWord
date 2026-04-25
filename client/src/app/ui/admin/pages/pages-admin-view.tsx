'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './pages-admin-view.module.css';
import { useAuth } from '@/src/app/providers/auth-provider';
import { completePageWithAi, createPage, deletePage, fetchPages, PageDto, PagesQuery, updatePage } from '@/src/shared/api/pages';
import { Modal, Notifications, Pagination, PermissionGate, PageSlider, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, UiButton, showToast } from '@/src/shared/ui';
import Input from '@/src/shared/ui/Input/ui-input';
import { useDebounce } from '@/src/shared/hooks/use-debounce';
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from '@/src/shared/api/sliders';
import { OutputData } from '@editorjs/editorjs';
import { editorToolsToHtml } from '@/src/shared/lib/editor-tools-to-html';
import { MediaPickerModal } from '@/src/features/Media/ui/MediaPickerModal';

const Editor = dynamic(() => import('@/src/features/Editor/ui/Editor'), { ssr: false });

const defaultQuery: PagesQuery = { page: 1, limit: 20 };

type EditorForm = {
  title: string;
  slug: string;
  status: string;
  template: string;
  seoTitle: string;
  seoDescription: string;
  metaKeywords: string;
  featuredSliderId?: number | null;
};

const defaultForm: EditorForm = {
  title: '',
  slug: '',
  status: 'draft',
  template: 'default',
  seoTitle: '',
  seoDescription: '',
  metaKeywords: '',
  featuredSliderId: null,
};

const PagesPage = () => {
  const { accessToken } = useAuth();
  const [query, setQuery] = useState<PagesQuery>(defaultQuery);
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<PageDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageDto | null>(null);
  const [form, setForm] = useState<EditorForm>(defaultForm);
  const [editorData, setEditorData] = useState<OutputData>();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSlider, setPreviewSlider] = useState<SliderDetailsDto | null>(null);
  const [isLoadingPreviewSlider, setIsLoadingPreviewSlider] = useState(false);
  
  // Sliders
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isLoadingSliders, setIsLoadingSliders] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerCallback, setMediaPickerCallback] = useState<{ onSelect: (media: any) => void } | null>(null);

  const debouncedSearch = useDebounce(search, 300);

  // A bit of a hack to make the access token available to the vanilla JS Editor.js tools
  if (typeof window !== 'undefined') {
    (window as any).accessToken = accessToken;
  }

  useEffect(() => {
    const handleOpenMediaPicker = (event: CustomEvent) => {
      setMediaPickerCallback({ onSelect: event.detail.onSelect });
      setIsMediaPickerOpen(true);
    };

    window.addEventListener('open-media-picker', handleOpenMediaPicker as EventListener);

    return () => {
      window.removeEventListener('open-media-picker', handleOpenMediaPicker as EventListener);
    };
  }, []);
  
  const totalPages = useMemo(() => {
    if (!query.limit) return 1;
    return Math.max(1, Math.ceil((pages.length || 1) / query.limit));
  }, [pages.length, query.limit]);

  const loadPages = async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const data = await fetchPages(accessToken, {
        ...query,
        search: debouncedSearch || undefined,
      });
      setPages(data);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось загрузить страницы', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSliders = async () => {
    if (!accessToken) return;
    setIsLoadingSliders(true);
    try {
      const data = await fetchSliders(accessToken, { page: 1, limit: 100 });
      setSliders(data.data);
    } catch (error: any) {
      console.error('Error loading sliders:', error);
    } finally {
      setIsLoadingSliders(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [accessToken, query.page, query.limit, debouncedSearch]);

  useEffect(() => {
    if (isModalOpen) {
      loadSliders();
    }
  }, [isModalOpen, accessToken]);

  const handleCreatePage = () => {
    window.location.href = '/admin/pages/create';
  };

  const handleEditPage = (page: PageDto) => {
    window.location.href = `/admin/pages/create/${page.id}`;
  };

  const handleAiAssist = async () => {
    if (!accessToken) return;
    const prompt = window.prompt('Что сделать с текстом? Например: "сделай короче и структурированнее"');
    if (!prompt?.trim() || !editorData) return;
    setIsAiLoading(true);
    try {
      // For AI assistant, we can convert current blocks to a simple text representation
      const content = editorData.blocks.map(block => block.data.text || '').filter(Boolean).join('\n');
      const result = await completePageWithAi(accessToken, { prompt: prompt.trim(), content });
      
      // The result is simple text, so we replace the editor content with a single paragraph block
      setEditorData({
        blocks: [{ type: 'paragraph', data: { text: result.text } }]
      });

      showToast('AI обновил текст', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'AI недоступен', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePreview = async () => {
    const html = editorData ? editorToolsToHtml(editorData.blocks) : '';
    setPreviewHtml(html);
    setPreviewSlider(null);

    if (form.featuredSliderId) {
      if (!accessToken) {
        showToast('Токен доступа отсутствует для предпросмотра слайдера', 'error');
        return;
      }
      setIsLoadingPreviewSlider(true);
      try {
        const slider = await getSlider(accessToken, form.featuredSliderId);
        setPreviewSlider(slider);
      } catch (error: any) {
        showToast(error?.response?.data?.message || 'Не удалось загрузить слайдер для предпросмотра', 'error');
      } finally {
        setIsLoadingPreviewSlider(false);
      }
    }

    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast('Название и slug обязательны', 'error');
      return;
    }
    setIsSaving(true);
    
    try {
      const pageData = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        status: form.status,
        template: form.template,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
        metaKeywords: form.metaKeywords
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        featuredSliderId: form.featuredSliderId || undefined,
        contentBlocks: editorData ? editorData.blocks.map(block => ({
          type: block.type as any,
          id: Date.now() + Math.random(),
          config: block.data
        })) : [],
        content: editorData ? editorToolsToHtml(editorData.blocks) : '', // for legacy support
      };

      if (editingPage) {
        const updated = await updatePage(accessToken, editingPage.id, pageData);
        setPages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast('Страница обновлена', 'success');
      } else {
        const created = await createPage(accessToken, pageData);
        setPages((prev) => [created, ...prev]);
        showToast('Страница создана', 'success');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Ошибка сохранения', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!accessToken) return;
    if (!confirm('Удалить страницу?')) return;
    try {
      await deletePage(accessToken, id);
      setPages((prev) => prev.filter((item) => item.id !== id));
      showToast('Страница удалена', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Не удалось удалить страницу', 'error');
    }
  };

  return (
    <div className={styles.root}>
      <Notifications />
      <MediaPickerModal
        open={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media) => {
          if (mediaPickerCallback) {
            mediaPickerCallback.onSelect(media);
          }
          setIsMediaPickerOpen(false);
        }}
        zIndex={2001}
      />
      <div className={styles.toolbar}>
        <Input
          className={styles.search}
          theme="secondary"
          icon="left"
          placeholder="Поиск страниц..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <PermissionGate resource="pages" level={2}>
          <UiButton theme="primary" onClick={handleCreatePage}>
            Создать страницу
          </UiButton>
        </PermissionGate>
      </div>

      <Table className={styles.table}>
        <TableHeader>
          <TableRow>
            <TableHead>Название</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4}>Загрузка...</TableCell>
            </TableRow>
          ) : pages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>Страницы не найдены</TableCell>
            </TableRow>
          ) : (
            pages.map((page) => (
              <TableRow key={page.id}>
                <TableCell>{page.title}</TableCell>
                <TableCell>{page.slug}</TableCell>
                <TableCell>{page.status === 'published' ? 'Опубликовано' : 'Черновик'}</TableCell>
                <TableCell className={styles.actions}>
                  <UiButton theme="secondary" onClick={() => handleEditPage(page)}>
                    Редактировать
                  </UiButton>
                  <PermissionGate resource="pages" level={2}>
                    <UiButton theme="warning" onClick={() => handleDelete(page.id)}>
                      Удалить
                    </UiButton>
                  </PermissionGate>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className={styles.pagination}>
        <Pagination page={query.page || 1} total={pages.length} perPage={query.limit || 20} onChange={(page) => setQuery((prev) => ({ ...prev, page }))} />
      </div>

      <PermissionGate resource="pages" level={2}>
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPage ? 'Редактировать страницу' : 'Создать страницу'}>
          <div className={styles.modalContent}>
            <div className={styles.grid}>
              <div className={styles.mainCol}>
                <Input
                  className={styles.input}
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Название"
                />
                <div className={styles.editorWrapper}>
                  <Editor
                    holder="editorjs-container"
                    data={editorData}
                    onChange={setEditorData}
                  />
                  <div className={styles.editorAitoolbar}>
                     <UiButton theme="secondary" onClick={handleAiAssist}>{isAiLoading ? 'AI...' : '✨ AI'}</UiButton>
                  </div>
                </div>
              </div>

              <div className={styles.sideCol}>
                <label className={styles.label}>Slug</label>
                <Input value={form.slug} onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))} />

                <label className={styles.label}>Статус</label>
                <Select
                  options={[
                    { value: 'draft', label: 'Черновик' },
                    { value: 'published', label: 'Опубликовано' },
                  ]}
                  value={form.status}
                  onChange={(value) => setForm((prev) => ({ ...prev, status: value as string }))}
                />

                <label className={styles.label}>Шаблон</label>
                <Input value={form.template} onChange={(event) => setForm((prev) => ({ ...prev, template: event.target.value }))} />

                <label className={styles.label}>SEO заголовок</label>
                <Input value={form.seoTitle} onChange={(event) => setForm((prev) => ({ ...prev, seoTitle: event.target.value }))} />

                <label className={styles.label}>SEO описание</label>
                <textarea
                  className={styles.textarea}
                  value={form.seoDescription}
                  onChange={(event) => setForm((prev) => ({ ...prev, seoDescription: event.target.value }))}
                />

                <label className={styles.label}>Ключевые слова (через запятую)</label>
                <Input value={form.metaKeywords} onChange={(event) => setForm((prev) => ({ ...prev, metaKeywords: event.target.value }))} />

                <label className={styles.label}>Основной слайдер</label>
                <Select
                  options={[
                    { value: '', label: 'Без слайдера' },
                    ...sliders.map((slider) => ({ value: slider.id.toString(), label: slider.name })),
                  ]}
                  value={form.featuredSliderId?.toString() || ''}
                  onChange={(value) => setForm((prev) => ({ 
                    ...prev, 
                    featuredSliderId: value ? parseInt(value as string) : null 
                  }))}
                  disabled={isLoadingSliders}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <UiButton theme="secondary" onClick={() => setIsModalOpen(false)}>
                Отмена
              </UiButton>
              <UiButton theme="secondary" onClick={handlePreview}>
                Предпросмотр
              </UiButton>
              <UiButton theme="primary" onClick={handleSave}>
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </UiButton>
            </div>
          </div>
        </Modal>
      </PermissionGate>

      <Modal open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Предпросмотр страницы">
        <div className={styles.previewModalContent}>
          <div className={styles.previewHeader}>
            <h2>{form.title || 'Предпросмотр страницы'}</h2>
            <p className={styles.previewSubtitle}>
              Статус: {form.status === 'published' ? 'Опубликовано' : 'Черновик'} · Шаблон: {form.template}
            </p>
          </div>

          {isLoadingPreviewSlider ? (
            <div className={styles.previewLoader}>Загрузка слайдера...</div>
          ) : previewSlider ? (
            <div className={styles.previewSliderWrapper}>
              <PageSlider slider={previewSlider} autoPlay={false} showArrows={true} showDots={true} />
            </div>
          ) : form.featuredSliderId ? (
            <div className={styles.previewEmpty}>Не удалось загрузить слайдер для предпросмотра.</div>
          ) : null}

          <div className={styles.previewBody} dangerouslySetInnerHTML={{ __html: previewHtml }} />

          <div className={styles.modalActions}>
            <UiButton theme="secondary" onClick={() => setIsPreviewOpen(false)}>
              Закрыть
            </UiButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PagesPage;
