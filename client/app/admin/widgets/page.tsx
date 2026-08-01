"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
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
  UiButton,
} from "@/src/shared/ui";
import dynamic from "next/dynamic";
import { OutputData } from "@editorjs/editorjs";
import { productsApi } from "@/src/entities/Product/api";
import { fetchProductCategories } from "@/src/shared/api/products";
import styles from "./widgets.module.css";

const RichEditor = dynamic(() => import("@/src/features/Editor/RichEditor"), {
  ssr: false,
  loading: () => (
    <div className="p-4 border rounded bg-gray-50 text-gray-400">Loading editor...</div>
  ),
});

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
    config: {} as any,
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

  const CategoryTreeSelect = ({
    categories,
    selectedId,
    onChange,
  }: {
    categories: any[];
    selectedId?: number | null;
    onChange: (v: number | null) => void;
  }) => {
    const Node = ({ node, level = 0 }: { node: any; level?: number }) => {
      const [open, setOpen] = useState<boolean>(false);
      return (
        <div className={styles.treeNode} style={{ paddingLeft: `${level * 12}px` }}>
          <div className={styles.nodeLabel}>
            {node.children?.length > 0 && (
              <button className={styles.toggleButton} onClick={() => setOpen((s) => !s)}>
                {open ? "▾" : "▸"}
              </button>
            )}
            {node.children?.length === 0 && <span style={{ width: 20 }} />}
            <span
              className={`${styles.selectLabel} ${selectedId === node.id ? styles.selected : ""}`}
              onClick={() => onChange(node.id)}
            >
              {node.name}
            </span>
          </div>
          {open &&
            node.children?.map((child: any) => (
              <Node key={child.id} node={child} level={level + 1} />
            ))}
        </div>
      );
    };

    return (
      <div className={styles.categorySelect}>
        <div
          className={styles.selectHeader}
          onClick={() => onChange(null)}
          style={{ cursor: "pointer", fontWeight: !selectedId ? "bold" : "normal" }}
        >
          No Category (All Products)
        </div>
        <div className={styles.tree}>
          {categories.map((cat) => (
            <Node key={cat.id} node={cat} />
          ))}
        </div>
      </div>
    );
  };

  const ProductAutocomplete = ({
    value,
    onChange,
  }: {
    value: string | number;
    onChange: (v: string | number) => void;
  }) => {
    const [q, setQ] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [loadingP, setLoadingP] = useState(false);
    const timerRef = React.useRef<number | null>(null);

    useEffect(() => {
      if (value && !q) {
        const item = categoriesFlat.find((c) => c.id === value || c.slug === value);
        if (item) setQ(item.name || item.slug || "");
      }
    }, [value, categoriesFlat]);

    useEffect(() => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(async () => {
        try {
          setLoadingP(true);
          const res = await productsApi.getProducts({ search: q, limit: 10 });
          setResults(res.data || []);
        } catch (err) {
          // ignore
        } finally {
          setLoadingP(false);
        }
      }, 300) as unknown as number;

      return () => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      };
    }, [q]);

    const select = (item: any) => {
      onChange(item.id ?? item.slug);
      setQ(item.name || item.slug || "");
      setOpen(false);
    };

    return (
      <div className={styles.autocomplete}>
        <input
          value={q || String(value ?? "")}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search product by name or slug..."
          className={styles.autocompleteInput}
        />
        {open && (
          <div className={styles.autocompleteDropdown}>
            {loadingP && <div className={styles.autocompleteItem}> Loading... </div>}
            {!loadingP && results.length === 0 && (
              <div className={styles.autocompleteItem}>Nothing found</div>
            )}
            {!loadingP &&
              results.map((r) => (
                <div
                  key={r.id || r.slug}
                  className={styles.autocompleteItem}
                  onClick={() => select(r)}
                >
                  <div>
                    <strong>{r.name}</strong>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>{r.slug}</div>
                </div>
              ))}
          </div>
        )}
      </div>
    );
  };

  const widgetTypes = [
    { value: "text", label: "Text Block" },
    { value: "image", label: "Image" },
    { value: "slider", label: "Slider" },
    { value: "gallery", label: "Gallery" },
    { value: "form", label: "Form" },
    { value: "social", label: "Social Networks" },
    { value: "custom", label: "Custom" },
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
      showToast("Error loading widgets", "error");
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
        content:
          form.type === "text"
            ? JSON.stringify(editorData)
            : form.type === "custom" && form.config && form.config.content
              ? JSON.stringify(form.config.content)
              : JSON.stringify(editorData),
        config: form.config || {},
      };

      if (editingWidget) {
        await updateWidget(accessToken, editingWidget.id, widgetData);
        showToast("Widget updated", "success");
      } else {
        await createWidget(accessToken, widgetData);
        showToast("Widget created", "success");
      }
      setShowModal(false);
      loadWidgets();
    } catch (error) {
      showToast("Error saving widget", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this widget?")) {
      try {
        await deleteWidget(accessToken, id);
        showToast("Widget deleted", "success");
        loadWidgets();
      } catch (error) {
        showToast("Error deleting widget", "error");
      }
    }
  };

  const handleStatusChange = async (id: number, status: "active" | "inactive") => {
    try {
      await updateWidget(accessToken, id, { status });
      showToast("Status changed", "success");
      loadWidgets();
    } catch (error) {
      showToast("Error changing status", "error");
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
        <h1> Widgets </h1>
        <p>Manage widgets for site</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Input
            placeholder="Search widgets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all"> All Types </option>
            {widgetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <UiButton theme="primary" onClick={handleCreate} className={styles.createButton}>
          ➕ Create Widget
        </UiButton>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}> Loading... </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead> Type </TableHead>
                <TableHead> Name </TableHead>
                <TableHead>Slug</TableHead>
                <TableHead> Position </TableHead>
                <TableHead> Status </TableHead>
                <TableHead> Actions </TableHead>
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
                      {widget.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className={styles.actions}>
                      <UiButton
                        theme="secondary"
                        onClick={() => handleEdit(widget)}
                        className={styles.editButton}
                      >
                        ✏️ Edit
                      </UiButton>
                      <UiButton
                        theme="secondary"
                        onClick={() =>
                          handleStatusChange(
                            widget.id,
                            widget.status === "active" ? "inactive" : "active",
                          )
                        }
                        className={styles.statusButton}
                      >
                        {widget.status === "active" ? "🔴 Disable" : "🟢 Enable"}
                      </UiButton>
                      <UiButton
                        theme="warning"
                        onClick={() => handleDelete(widget.id)}
                        className={styles.deleteButton}
                      >
                        🗑️ Delete
                      </UiButton>
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
        title={editingWidget ? "Edit Widget" : "Create Widget"}
      >
        <div className={styles.modalContent}>
          <div className={styles.formGroup}>
            <label> Name </label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter widget name"
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
            <label>Widget Type</label>
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
            <label> Position </label>
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
            <label> Status </label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, status: e.target.value as "active" | "inactive" }))
              }
              className={styles.select}
            >
              <option value="active"> Active </option>
              <option value="inactive"> Inactive </option>
            </select>
          </div>

          {form.type === "text" && (
            <div className={styles.formGroup}>
              <label>Content</label>
              <div className={styles.editor}>
                <RichEditor
                  holder="widget-rich-editor"
                  data={editorData}
                  onChange={setEditorData}
                  placeholder="Enter widget content..."
                />
              </div>
            </div>
          )}

          {form.type === "custom" && (
            <div className={styles.formGroup}>
              <label>Widget Configuration</label>

              <div className={styles.formRow}>
                <label>Custom Widget Type</label>
                <select
                  value={form.config?.widgetType || ""}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      config: { ...(prev.config || {}), widgetType: e.target.value },
                    }))
                  }
                  className={styles.select}
                >
                  <option value="">Select...</option>
                  <option value="products-list">Products List</option>
                  <option value="product-single">Product Single</option>
                </select>
              </div>

              {form.config?.widgetType === "products-list" && (
                <>
                  <div className={styles.formRow}>
                    <label>Title</label>
                    <Input
                      value={form.config?.title || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: { ...(prev.config || {}), title: e.target.value },
                        }))
                      }
                      placeholder="Widget Title"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Show Pagination</label>
                    <input
                      type="checkbox"
                      checked={!!form.config?.showPagination}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: { ...(prev.config || {}), showPagination: e.target.checked },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Limit</label>
                    <Input
                      type="number"
                      value={form.config?.limit ?? 10}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: { ...(prev.config || {}), limit: parseInt(e.target.value) || 10 },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label> Category </label>
                    <div>
                      <CategoryTreeSelect
                        categories={categoriesTree}
                        selectedId={form.config?.categoryId ?? null}
                        onChange={(v) =>
                          setForm((prev) => ({
                            ...prev,
                            config: { ...(prev.config || {}), categoryId: v ?? undefined },
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <label> Search </label>
                    <Input
                      value={form.config?.search || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: { ...(prev.config || {}), search: e.target.value },
                        }))
                      }
                      placeholder="Filter by name..."
                    />
                  </div>
                </>
              )}

              {form.config?.widgetType === "product-single" && (
                <div className={styles.formRow}>
                  <label>Product</label>
                  <ProductAutocomplete
                    value={form.config?.productId || ""}
                    onChange={(v) =>
                      setForm((prev) => ({
                        ...prev,
                        config: { ...(prev.config || {}), productId: v },
                      }))
                    }
                  />
                </div>
              )}
              {form.config?.widgetType === "product-single" && (
                <>
                  <div className={styles.formRow}>
                    <label>Show Reviews</label>
                    <input
                      type="checkbox"
                      checked={form.config?.showReviews ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: { ...(prev.config || {}), showReviews: e.target.checked },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Allow Review Submission</label>
                    <input
                      type="checkbox"
                      checked={form.config?.allowReviewSubmission ?? true}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: {
                            ...(prev.config || {}),
                            allowReviewSubmission: e.target.checked,
                          },
                        }))
                      }
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label>Reviews Limit</label>
                    <Input
                      type="number"
                      value={form.config?.reviewsLimit ?? 10}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          config: {
                            ...(prev.config || {}),
                            reviewsLimit: parseInt(e.target.value) || 10,
                          },
                        }))
                      }
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <div className={styles.modalActions}>
            <UiButton theme="primary" onClick={handleSave} className={styles.saveButton}>
              {editingWidget ? "Save" : "Create"}
            </UiButton>
            <UiButton
              theme="secondary"
              onClick={() => setShowModal(false)}
              className={styles.cancelButton}
            >
              {" "}
              Cancel{" "}
            </UiButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
