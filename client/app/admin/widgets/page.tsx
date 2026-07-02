"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import Button from "@/src/shared/ui/Button/ui-button";
import { fetchWidgets, createWidget, updateWidget, deleteWidget } from "@/src/shared/api/widgets";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import { useAuth } from "@/src/app/providers/auth-provider";
import {
  Pagination,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/src/shared/ui";
import dynamic from 'next/dynamic';

const RichEditor = dynamic(() => import('@/src/features/Editor/RichEditor'), {
  ssr: false,
  loading: () => <div className="p-4 border rounded bg-gray-50 text-gray-400">Загрузка редактора...</div>
});
import { OutputData } from "@editorjs/editorjs";
import styles from "./widgets.module.css";
import { productsApi } from '@/src/entities/Product/api';
import { fetchProductCategories } from '@/src/shared/api/products';

export default function WidgetsPage() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [editorData, setEditorData] = useState<OutputData>({ blocks: [] });
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "text" as "text" | "image" | "slider" | "gallery" | "form" | "social" | "custom",
    status: "active" as "active" | "inactive",
    position: 0,
    config: {},
  });

  const [categoriesFlat, setCategoriesFlat] = useState<any[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const buildTree = (items: any[]) => {
    const map = new Map<number, any>();
    items.forEach((it) => map.set(it.id, { ...it, children: [] }));
    const roots: any[] = [];
    for (const it of map.values()) {
      if (it.parentId && map.has(it.parentId)) {
        map.get(it.parentId).children.push(it);
      } else {
        roots.push(it);
      }
    }
    return roots;
  };

  const loadCategories = async () => {
    try {
      const res = await fetchProductCategories(accessToken, 1, 1000, "");
      const data = res.data || [];
      setCategoriesFlat(data);
      setCategoriesTree(buildTree(data));
    } catch (err) {
      // ignore
    }
  };

  const CategoryTreeSelect = ({ categories, selectedId, onChange }: { categories: any[]; selectedId?: number | null; onChange: (v: number | null) => void }) => {
    const Node = ({ node, level = 0 }: { node: any; level?: number }) => {
      const [open, setOpen] = useState<boolean>(false);
      return (
        <div className={styles.treeNode} style={{ paddingLeft: `${level * 12}px` }}>
          <div className={styles.nodeLabel}>
            {node.children?.length > 0 && (
              <button className={styles.toggleButton} onClick={() => setOpen((s) => !s)}>{open ? '▾' : '▸'}</button>
            )}
            <label>
              <input
                type="radio"
                name="category-select"
                checked={selectedId === node.id}
                onChange={() => onChange(node.id)}
                className={styles.radio}
              />
              <span>{node.name}</span>
            </label>
          </div>
          {open && node.children?.length > 0 && (
            <div className={styles.children}>
              {node.children.map((c: any) => (
                <Node key={c.id} node={c} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className={styles.categoryTree}>
        <div className={styles.noCategory}>
          <label>
            <input type="radio" name="category-select" checked={!selectedId} onChange={() => onChange(null)} /> No category
          </label>
        </div>
        {categories.map((n) => (
          <Node key={n.id} node={n} />
        ))}
      </div>
    );
  };

  const ProductAutocomplete = ({ value, onChange }: { value?: string | number | null; onChange: (v: string | number | null) => void }) => {
    const [q, setQ] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loadingP, setLoadingP] = useState(false);
    const [open, setOpen] = useState(false);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
      if (!q) {
        setResults([]);
        return;
      }
      setLoadingP(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      // debounce
      timerRef.current = window.setTimeout(async () => {
        try {
          const res: any = await productsApi.getProducts({ page: 1, limit: 10, search: q });
          const items = res && res.data ? res.data : res || [];
          setResults(items || []);
        } catch (err) {
          setResults([]);
        } finally {
          setLoadingP(false);
          setOpen(true);
        }
      }, 250);

      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }, [q]);

    const select = (item: any) => {
      onChange(item.id ?? item.slug);
      setQ(item.name || item.slug || '');
      setOpen(false);
    };

    return (
      <div className={styles.autocomplete}>
        <input
          value={q || String(value ?? '')}
          onChange={(e) => { setQ(e.target.value); }}
          onFocus={() => setOpen(true)}
          placeholder="Поиск товара по имени или slug..."
          className={styles.autocompleteInput}
        />
        {open && (
          <div className={styles.autocompleteDropdown}>
            {loadingP && <div className={styles.autocompleteItem}>Загрузка...</div>}
            {!loadingP && results.length === 0 && <div className={styles.autocompleteItem}>Ничего не найдено</div>}
            {!loadingP && results.map((r) => (
              <div key={r.id || r.slug} className={styles.autocompleteItem} onClick={() => select(r)}>
                <div><strong>{r.name}</strong></div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{r.slug}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const widgetTypes = [
    { value: "text", label: "Текстовый блок" },
    { value: "image", label: "Изображение" },
    { value: "slider", label: "Слайдер" },
    { value: "gallery", label: "Галерея" },
    { value: "form", label: "Форма" },
    { value: "social", label: "Социальные сети" },
    { value: "custom", label: "Пользовательский" },
  ];

  useEffect(() => {
    loadWidgets();
  }, [pagination.page, search, typeFilter]);

  const loadWidgets = async () => {
    try {
      setLoading(true);
      const response = await fetchWidgets(accessToken, {
        page: pagination.page,
        limit: pagination.limit,
        search,
        type: typeFilter === "all" ? undefined : typeFilter,
      });
      setWidgets(response.data);
      setPagination((prev) => ({ ...prev, total: response.total }));
    } catch (error) {
      showToast("Ошибка при загрузке виджетов", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingWidget(null);
    setForm({
      name: "",
      slug: "",
      type: "text",
      status: "active",
      position: 0,
      config: {},
    });
    setEditorData({ blocks: [] });
    setShowModal(true);
  };

  const handleEdit = (widget: any) => {
    setEditingWidget(widget);
    setForm({
      name: widget.name,
      slug: widget.slug,
      type: widget.type,
      status: widget.status,
      position: widget.position,
      config: widget.config || {},
    });
    setEditorData(widget.content ? JSON.parse(widget.content) : { blocks: [] });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const widgetData: any = {
        ...form,
        content: form.type === 'text' ? JSON.stringify(editorData) : (form.type === 'custom' && form.config && form.config.content ? JSON.stringify(form.config.content) : JSON.stringify(editorData)),
        config: form.config || {},
      };

      if (editingWidget) {
        await updateWidget(accessToken, editingWidget.id, widgetData);
        showToast("Виджет обновлен", "success");
      } else {
        await createWidget(accessToken, widgetData);
        showToast("Виджет создан", "success");
      }
      setShowModal(false);
      loadWidgets();
    } catch (error) {
      showToast("Ошибка при сохранении виджета", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Вы уверены что хотите удалить этот виджет?")) {
      try {
        await deleteWidget(accessToken, id);
        showToast("Виджет удален", "success");
        loadWidgets();
      } catch (error) {
        showToast("Ошибка при удалении виджета", "error");
      }
    }
  };

  const handleStatusChange = async (id: number, status: "active" | "inactive") => {
    try {
      await updateWidget(accessToken, id, { status });
      showToast("Статус изменен", "success");
      loadWidgets();
    } catch (error) {
      showToast("Ошибка при изменении статуса", "error");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return "📝";
      case "image":
        return "🖼️";
      case "slider":
        return "🎠";
      case "gallery":
        return "🖼️";
      case "form":
        return "📋";
      case "social":
        return "🌐";
      case "custom":
        return "⚙️";
      default:
        return "📦";
    }
  };

  const getTypeLabel = (type: string) => {
    const widgetType = widgetTypes.find((t) => t.value === type);
    return widgetType ? widgetType.label : type;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Виджеты</h1>
        <p>Управление виджетами для сайта</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Поиск виджетов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">Все типы</option>
            {widgetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleCreate} className={styles.createButton}>
          ➕ Создать виджет
        </Button>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Загрузка...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Тип</TableHead>
                <TableHead>Название</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Позиция</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {widgets.map((widget) => (
                <TableRow key={widget.id}>
                  <TableCell>
                    <span className={styles.typeIcon}>{getTypeIcon(widget.type)}</span>
                    {getTypeLabel(widget.type)}
                  </TableCell>
                  <TableCell>{widget.name}</TableCell>
                  <TableCell>{widget.slug}</TableCell>
                  <TableCell>{widget.position}</TableCell>
                  <TableCell>
                    <span className={`${styles.status} ${styles[widget.status]}`}>
                      {widget.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <Button onClick={() => handleEdit(widget)} className={styles.editButton}>
                        ✏️
                      </Button>
                      <Button
                        onClick={() =>
                          handleStatusChange(
                            widget.id,
                            widget.status === "active" ? "inactive" : "active",
                          )
                        }
                        className={styles.statusButton}
                      >
                        {widget.status === "active" ? "🔴" : "🟢"}
                      </Button>
                      <Button
                        onClick={() => handleDelete(widget.id)}
                        className={styles.deleteButton}
                      >
                        🗑️
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination.total > pagination.limit && (
        <div className={styles.pagination}>
          <Pagination
            page={pagination.page}
            total={pagination.total}
            perPage={pagination.limit}
            onChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          />
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingWidget ? "Редактировать виджет" : "Создать виджет"}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label>Название</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Введите название виджета"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Тип виджета</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as any }))}
              className={styles.select}
            >
              {widgetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {getTypeIcon(type.value)} {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Позиция</label>
            <Input
              type="number"
              value={form.position}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, position: parseInt(e.target.value) || 0 }))
              }
              placeholder="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Статус</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as "active" | "inactive" }))
              }
              className={styles.select}
            >
              <option value="active">Активен</option>
              <option value="inactive">Неактивен</option>
            </select>
          </div>

          {form.type === "text" && (
            <div className={styles.formGroup}>
              <label>Содержимое</label>
              <div className={styles.editor}>
                <RichEditor
                  holder="widget-rich-editor"
                  data={editorData}
                  onChange={setEditorData}
                  placeholder="Введите содержимое виджета..."
                />
              </div>
            </div>
          )}

          {form.type === 'custom' && (
            <div className={styles.formGroup}>
              <label>Конфигурация виджета</label>

              <div className={styles.formRow}>
                <label>Тип кастомного виджета</label>
                <select
                  value={form.config?.widgetType || ''}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), widgetType: e.target.value } }))
                  }
                  className={styles.select}
                >
                  <option value="">Выбрать...</option>
                  <option value="products-list">Products List</option>
                  <option value="product-single">Product Single</option>
                </select>
              </div>

              {form.config?.widgetType === 'products-list' && (
                <>
                  <div className={styles.formRow}>
                    <label>Заголовок</label>
                    <Input
                      value={form.config?.title || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), title: e.target.value } }))
                      }
                      placeholder="Заголовок виджета"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Показывать пагинацию</label>
                    <input
                      type="checkbox"
                      checked={!!form.config?.showPagination}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), showPagination: e.target.checked } }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Лимит</label>
                    <Input
                      type="number"
                      value={form.config?.limit ?? 10}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), limit: parseInt(e.target.value) || 10 } }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Категория</label>
                    <div>
                      <CategoryTreeSelect
                        categories={categoriesTree}
                        selectedId={form.config?.categoryId ?? null}
                        onChange={(v) => setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), categoryId: v ?? undefined } }))}
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label>Поиск</label>
                    <Input
                      value={form.config?.search || ''}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), search: e.target.value } }))
                      }
                      placeholder="Фильтр по названию..."
                    />
                  </div>
                </>
              )}

              {form.config?.widgetType === 'product-single' && (
                <div className={styles.formRow}>
                  <label>Товар</label>
                  <ProductAutocomplete
                    value={form.config?.productId || ''}
                    onChange={(v) => setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), productId: v } }))}
                  />
                </div>
              )}
              {form.config?.widgetType === 'product-single' && (
                <>
                  <div className={styles.formRow}>
                    <label>Показывать отзывы</label>
                    <input
                      type="checkbox"
                      checked={form.config?.showReviews ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), showReviews: e.target.checked } }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Разрешить отправку отзывов</label>
                    <input
                      type="checkbox"
                      checked={form.config?.allowReviewSubmission ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), allowReviewSubmission: e.target.checked } }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Лимит отзывов</label>
                    <Input
                      type="number"
                      value={form.config?.reviewsLimit ?? 10}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, config: { ...(prev.config || {}), reviewsLimit: parseInt(e.target.value) || 10 } }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.modalActions}>
            <Button onClick={handleSave} className={styles.saveButton}>
              {editingWidget ? "Сохранить" : "Создать"}
            </Button>
            <Button onClick={() => setShowModal(false)} className={styles.cancelButton}>
              Отмена
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
