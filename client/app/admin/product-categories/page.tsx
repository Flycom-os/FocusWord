"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import {
  fetchProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  productsApi,
} from "@/src/shared/api/products";
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
import { Edit, Folder, FolderOpen, Plus, Trash2 } from "lucide-react";

import styles from "./product-categories.module.css";

const ProductCategoriesPage = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "" as string | number,
    status: "active" as "active" | "inactive",
  });
  const { accessToken } = useAuth();

  const loadCategories = async () => {
    try {
      const res = await productsApi.getCategories(accessToken, 1, 1000);
      const items = res && res.data ? res.data : (res as any) || [];
      setCategories(items);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [accessToken]);

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      slug: "",
      description: "",
      parentId: "",
      status: "active",
    });
    setShowModal(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      parentId: category.parentId || "",
      status: category.status || "active",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (!form.name.trim()) {
        showToast("Category name is required", "error");
        return;
      }

      const parentIdNum = form.parentId ? Number(form.parentId) : null;
      const slugVal = form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const dataToSave = {
        name: form.name.trim(),
        slug: slugVal,
        description: form.description.trim(),
        parentId: parentIdNum !== null ? parentIdNum : undefined,
        status: form.status,
      };

      if (editingCategory) {
        await productsApi.updateCategory(accessToken, Number(editingCategory.id), dataToSave);
        showToast("Category updated successfully", "success");
      } else {
        await productsApi.createCategory(accessToken, dataToSave);
        showToast("Category created successfully", "success");
      }
      setShowModal(false);
      loadCategories();
    } catch (error: any) {
      console.error("Failed to save category:", error);
      showToast(error?.response?.data?.message || "Failed to save category", "error");
    }
  };

  const handleDelete = async (category: any) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        await productsApi.deleteCategory(accessToken, Number(selectedCategory.id));
        await loadCategories();
        setShowDeleteModal(false);
        setSelectedCategory(null);
        showToast("Category deleted successfully", "success");
      } catch (error) {
        console.error("Failed to delete category:", error);
        showToast("Failed to delete category", "error");
      }
    }
  };

  const renderCategory = (category: any, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const productCount = category.products?.length || 0;

    return (
      <React.Fragment key={category.id}>
        <tr className={styles.categoryRow}>
          <td>
            <div className={styles.categoryInfo} style={{ paddingLeft: `${level * 20}px` }}>
              <button className={styles.expandButton} onClick={() => toggleExpanded(category.id)}>
                {hasChildren ? (
                  isExpanded ? (
                    <FolderOpen size={20} />
                  ) : (
                    <Folder size={20} />
                  )
                ) : (
                  <div style={{ width: 20 }} />
                )}
              </button>
              <span>{category.name}</span>
            </div>
          </td>
          <td>{category.description}</td>
          <td>{productCount}</td>
          <td>
            <span className={styles.categoryStatus}>
              {category.status === "inactive" ? "Inactive" : "Active"}
            </span>
          </td>
          <td>
            <div className={styles.actions}>
              <UiButton theme="secondary" onClick={() => handleEdit(category)}>
                <Edit size={16} />
              </UiButton>
              <UiButton theme="warning" onClick={() => handleDelete(category)}>
                <Trash2 size={16} />
              </UiButton>
            </div>
          </td>
        </tr>
        {hasChildren &&
          isExpanded &&
          category.children?.map((child: any) => renderCategory(child, level + 1))}
      </React.Fragment>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  // Filter out the category itself and its subcategories from potential parent dropdown options
  const getParentOptions = () => {
    const list: any[] = [];
    const traverse = (items: any[]) => {
      items.forEach((item) => {
        if (editingCategory && item.id === editingCategory.id) {
          return; // skip self and children
        }
        list.push(item);
        if (item.children) traverse(item.children);
      });
    };
    // Root categories
    const rootCats = categories.filter((cat) => !cat.parentId);
    traverse(rootCats);
    return list;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Product Categories</h1>
        <UiButton theme="primary" className={styles.addButton} onClick={handleCreate}>
          <Plus size={20} />
          Add Category
        </UiButton>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Categories</h3>
          <p className={styles.statValue}>{Array.isArray(categories) ? categories.length : 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Parent Categories</h3>
          <p className={styles.statValue}>
            {(Array.isArray(categories) ? categories : []).filter((cat) => !cat.parentId).length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Subcategories</h3>
          <p className={styles.statValue}>
            {(Array.isArray(categories) ? categories : []).filter((cat) => cat.parentId).length}
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category Name</th>
              <th>Description</th>
              <th>Products</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(categories) ? categories : [])
              .filter((category) => !category.parentId)
              .map((category) => renderCategory(category))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete "{selectedCategory?.name}"?</p>
            <div className={styles.modalActions}>
              <UiButton theme="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </UiButton>
              <UiButton theme="warning" onClick={confirmDelete}>
                Delete
              </UiButton>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingCategory ? "Edit Category" : "Create Category"}
      >
        <div className={styles.modalContent} style={{ width: "100%", maxWidth: "100%", padding: 0 }}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Category Name</label>
            <Input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter category name"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="url-slug"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Parent Category</label>
            <select
              value={form.parentId}
              onChange={(e) => setForm((prev) => ({ ...prev, parentId: e.target.value }))}
              className={styles.select}
            >
              <option value="">No Parent (Root Category)</option>
              {getParentOptions().map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
              className={styles.select}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Category description"
              className={styles.textarea}
              rows={4}
            />
          </div>

          <div className={styles.modalActions}>
            <UiButton theme="primary" onClick={handleSave}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </UiButton>
            <UiButton theme="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </UiButton>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductCategoriesPage;
