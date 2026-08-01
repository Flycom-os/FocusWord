"use client";

import { Plus, Edit3, Trash2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Input from "@/src/shared/ui/Input/ui-input";
import { UiButton } from "@/src/shared/ui";
import {
  recordsApi,
  RecordDto,
  CategoryDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/src/shared/api/records";
import { showToast } from "@/src/shared/ui/Notifications/ui-notifications";
import styles from "./categories.module.css";

export default function RecordCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    title: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, [currentPage, search]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await recordsApi.getCategories(currentPage, 10, search);
      setCategories(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      showToast("Error loading categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setCategoryForm({
      title: "",
      slug: "",
      description: "",
    });
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category: CategoryDto) => {
    setCategoryForm({
      title: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      const categoryData: CreateCategoryDto = {
        name: categoryForm.title,
        slug: categoryForm.slug,
        description: categoryForm.description,
      };

      if (editingCategory) {
        await recordsApi.updateCategory(editingCategory.id.toString(), {
          ...categoryData,
          id: editingCategory.id,
        });
        showToast("Category updated", "success");
      } else {
        await recordsApi.createCategory(categoryData);
        showToast("Category created", "success");
      }

      setShowCreateModal(false);
      setEditingCategory(null);
      loadCategories();
    } catch (error) {
      showToast("Error saving category", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await recordsApi.deleteCategory(id);
      showToast("Category deleted", "success");
      loadCategories();
    } catch (error) {
      showToast("Error deleting category", "error");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Record Categories</h1>
        <p>Manage categories for records</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchSection}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className={styles.searchInput}
          />
        </div>
        <UiButton
          theme="primary"
          onClick={handleCreateCategory}
          className={styles.createButton}
          style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
        >
          <Plus size={16} /> Create Category
        </UiButton>
      </div>

      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : categories.length === 0 ? (
          <div className={styles.empty}>
            <h3>No categories</h3>
            <p>Create the first category for records</p>
            <UiButton theme="primary" onClick={handleCreateCategory}>
              Create Category
            </UiButton>
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map((category) => (
              <div key={category.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{category.name}</h3>
                </div>

                <div className={styles.cardContent}>
                  <p className={styles.slug}>/{category.slug}</p>
                  <p className={styles.description}>{category.description || "No description"}</p>
                </div>

                <div className={styles.cardMeta}>
                  <span className={styles.date}>
                    Created: {new Date(category.createdAt).toLocaleDateString("en-US")}
                  </span>
                  {category.updatedAt !== category.createdAt && (
                    <span className={styles.date}>
                      Updated: {new Date(category.updatedAt).toLocaleDateString("en-US")}
                    </span>
                  )}
                </div>

                <div className={styles.cardActions}>
                  <UiButton
                    onClick={() => handleEditCategory(category)}
                    className={styles.editButton}
                    theme="secondary"
                  >
                    <Edit3 size={16} /> Edit
                  </UiButton>
                  <UiButton
                    onClick={() => handleDeleteCategory(category.id.toString())}
                    className={styles.deleteButton}
                    theme="warning"
                  >
                    <Trash2 size={16} /> Delete
                  </UiButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <UiButton
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={styles.paginationButton}
            theme="secondary"
          >
            ←
          </UiButton>
          <span className={styles.paginationInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <UiButton
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={styles.paginationButton}
            theme="secondary"
          >
            →
          </UiButton>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingCategory ? "Edit Category" : "Create Category"}</h3>
              <button onClick={() => setShowCreateModal(false)} className={styles.closeButton}>
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Category Name</label>
                <Input
                  value={categoryForm.title}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter category name"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Slug</label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-slug"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Category description"
                  className={styles.textarea}
                  rows={4}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <UiButton
                theme="secondary"
                onClick={() => setShowCreateModal(false)}
                className={styles.cancelButton}
              >
                Cancel
              </UiButton>
              <UiButton theme="primary" onClick={handleSaveCategory} className={styles.saveButton}>
                {editingCategory ? "Save Changes" : "Create Category"}
              </UiButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
