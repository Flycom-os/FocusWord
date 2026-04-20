'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './pages-admin-view.module.css';
import { useAuth } from '@/src/app/providers/auth-provider';
import { completePageWithAi, createPage, deletePage, fetchPages, PageDto, PagesQuery, updatePage } from '@/src/shared/api/pages';
import { Modal, Notifications, Pagination, PermissionGate, PageSlider, Select, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, UiButton, showToast } from '@/src/shared/ui';
import Input from '@/src/shared/ui/Input/ui-input';
import { useDebounce } from '@/src/shared/hooks/use-debounce';
import { fetchSliders, getSlider, SliderDto, SliderDetailsDto } from '@/src/shared/api/sliders';

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
  const [initialEditorHtml, setInitialEditorHtml] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSlider, setPreviewSlider] = useState<SliderDetailsDto | null>(null);
  const [isLoadingPreviewSlider, setIsLoadingPreviewSlider] = useState(false);
  
  // Sliders
  const [sliders, setSliders] = useState<SliderDto[]>([]);
  const [isLoadingSliders, setIsLoadingSliders] = useState(false);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const debouncedSearch = useDebounce(search, 300);

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
      showToast({ type: 'error', message: error?.response?.data?.message || 'Не удалось загрузить страницы' });
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

  useEffect(() => {
    if (!isModalOpen || !editorRef.current) return;
    editorRef.current.innerHTML = initialEditorHtml || '';
    editorRef.current.focus();
  }, [isModalOpen, initialEditorHtml]);

  const openCreateModal = () => {
    setEditingPage(null);
    setForm(defaultForm);
    setInitialEditorHtml('');
    setIsModalOpen(true);
  };

  const openEditModal = (page: PageDto) => {
    setEditingPage(page);
    setForm({
      title: page.title || '',
      slug: page.slug || '',
      status: page.status || 'draft',
      template: page.template || 'default',
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      metaKeywords: (page.metaKeywords || []).join(', '),
      featuredSliderId: page.featuredSliderId || null,
    });
    setInitialEditorHtml(page.content || '');
    setIsModalOpen(true);
  };

  const execCommand = (event: React.MouseEvent<HTMLButtonElement>, command: string, value?: string) => {
    event.preventDefault();
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand(command, false, value);
  };

  const insertLink = () => {
    const url = window.prompt('Введите URL');
    if (!url) return;
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand('createLink', false, url);
  };

  const handleAiAssist = async () => {
    if (!accessToken) return;
    const prompt = window.prompt('Что сделать с текстом? Например: "сделай короче и структурированнее"');
    if (!prompt?.trim()) return;
    setIsAiLoading(true);
    try {
      const content = editorRef.current?.innerHTML || '';
      const result = await completePageWithAi(accessToken, { prompt: prompt.trim(), content });
      if (editorRef.current) {
        editorRef.current.innerHTML = result.text;
        editorRef.current.focus();
      }
      showToast({ type: 'success', message: 'AI обновил текст' });
    } catch (error: any) {
      showToast({ type: 'error', message: error?.response?.data?.message || 'AI недоступен' });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handlePreview = async () => {
    const html = editorRef.current?.innerHTML || '';
    setPreviewHtml(html);
    setPreviewSlider(null);

    if (form.featuredSliderId) {
      if (!accessToken) {
        showToast({ type: 'error', message: 'Токен доступа отсутствует для предпросмотра слайдера' });
        return;
      }
      setIsLoadingPreviewSlider(true);
      try {
        const slider = await getSlider(accessToken, form.featuredSliderId);
        setPreviewSlider(slider);
      } catch (error: any) {
        showToast({ type: 'error', message: error?.response?.data?.message || 'Не удалось загрузить слайдер для предпросмотра' });
      } finally {
        setIsLoadingPreviewSlider(false);
      }
    }

    setIsPreviewOpen(true);
  };

  const handleSave = async () => {
    if (!accessToken) return;
    if (!form.title.trim() || !form.slug.trim()) {
      showToast({ type: 'error', message: 'Название и slug обязательны' });
      return;
    }
    setIsSaving(true);
    const content = editorRef.current?.innerHTML || '';
    try {
      if (editingPage) {
        const updated = await updatePage(accessToken, editingPage.id, {
          title: form.title.trim(),
          slug: form.slug.trim(),
          content,
          status: form.status,
          template: form.template,
          seoTitle: form.seoTitle || undefined,
          seoDescription: form.seoDescription || undefined,
          metaKeywords: form.metaKeywords
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          featuredSliderId: form.featuredSliderId || null,
        });
        setPages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        showToast({ type: 'success', message: 'Страница обновлена' });
      } else {
        const created = await createPage(accessToken, {
          title: form.title.trim(),
          slug: form.slug.trim(),
          content,
          status: form.status,
          template: form.template,
          seoTitle: form.seoTitle || undefined,
          seoDescription: form.seoDescription || undefined,
          metaKeywords: form.metaKeywords
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          featuredSliderId: form.featuredSliderId || undefined,
        });
        setPages((prev) => [created, ...prev]);
        showToast({ type: 'success', message: 'Страница создана' });
      }
      setIsModalOpen(false);
    } catch (error: any) {
      showToast({ type: 'error', message: error?.response?.data?.message || 'Ошибка сохранения' });
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
      showToast({ type: 'success', message: 'Страница удалена' });
    } catch (error: any) {
      showToast({ type: 'error', message: error?.response?.data?.message || 'Не удалось удалить страницу' });
    }
  };

  return (
    <div className={styles.root}>
      <Notifications />

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
          <UiButton theme="primary" onClick={openCreateModal}>
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
                  <UiButton theme="secondary" onClick={() => openEditModal(page)}>
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
        <Pagination currentPage={query.page || 1} totalPages={totalPages} onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))} />
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
                <div className={styles.formatToolbar}>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'bold')}>B</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'italic')}>I</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'underline')}>U</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'formatBlock', 'h2')}>H2</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'formatBlock', 'h3')}>H3</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'insertUnorderedList')}>• List</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'insertOrderedList')}>1. List</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'formatBlock', 'blockquote')}>Quote</button>
                  <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => execCommand(event, 'formatBlock', 'pre')}>Code</button>
                  <button type="button" onClick={insertLink}>Link</button>
                  <button type="button" onClick={handleAiAssist}>{isAiLoading ? 'AI...' : 'AI'}</button>
                </div>
                <div
                  ref={editorRef}
                  className={styles.editor}
                  contentEditable
                  suppressContentEditableWarning
                />
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
