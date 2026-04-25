'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/src/shared/ui/Input/ui-input';
import Button from '@/src/shared/ui/Button/ui-button';
import {
  fetchProductCategories,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
  productsApi,
} from '@/src/shared/api/products';
import { showToast } from '@/src/shared/ui/Notifications/ui-notifications';
import { useAuth } from '@/src/app/providers/auth-provider';
import { Pagination, Modal, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/src/shared/ui';
import styles from './product-categories.module.css';
import { Edit, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { ProductCategory } from '@/src/entities/Product';

const ProductCategoriesPage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // @ts-ignore
      const data = await productsApi.getCategories();
      // @ts-ignore
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleDelete = async (category: ProductCategory) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory) {
      try {
        // @ts-ignore
        await productsApi.deleteCategory(selectedCategory.id);
        await loadCategories();
        setShowDeleteModal(false);
        setSelectedCategory(null);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const renderCategory = (category: ProductCategory, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const productCount = category.products?.length || 0;

    return (
      <React.Fragment key={category.id}>
        <tr className={styles.categoryRow} style={{ paddingLeft: `${level * 20}px` }}>
          <td>
            <div className={styles.categoryInfo}>
              <button 
                className={styles.expandButton}
                onClick={() => toggleExpanded(category.id)}
              >
                {hasChildren ? (
                  isExpanded ? <FolderOpen size={20} /> : <Folder size={20} />
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
            <span className={styles.categoryStatus}>Active</span>
          </td>
          <td>
            <div className={styles.actions}>
              <button className={styles.actionButton}>
                <Edit size={16} />
              </button>
              <button 
                className={styles.actionButton}
                onClick={() => handleDelete(category)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && category.children?.map(child => 
          renderCategory(child, level + 1)
        )}
      </React.Fragment>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Product Categories</h1>
        <button className={styles.addButton}>
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Categories</h3>
          <p className={styles.statValue}>{categories.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Parent Categories</h3>
          <p className={styles.statValue}>
            {categories.filter(cat => !cat.parentId).length}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Subcategories</h3>
          <p className={styles.statValue}>
            {categories.filter(cat => cat.parentId).length}
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
            {categories
              .filter(category => !category.parentId)
              .map(category => renderCategory(category))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete Category</h3>
            <p>Are you sure you want to delete "{selectedCategory?.name}"?</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.deleteButton}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCategoriesPage;
