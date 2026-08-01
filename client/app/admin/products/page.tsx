"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";
import { Product } from "@/src/entities/Product";
import { productsApi } from "@/src/entities/Product/api";
import { fetchProductCategories } from "@/src/shared/api/products";
import { useAuth } from "@/src/app/providers/auth-provider";
import Input from "@/src/shared/ui/Input/ui-input";
import { UiButton, Modal } from "@/src/shared/ui";
import styles from "./products.module.css";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const { accessToken } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: undefined as number | undefined,
    sku: "",
    stock: 0,
    images: "",
    status: "active",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await productsApi.getProducts();
      const data = res && res.data ? res.data : res || [];
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Simple tree selector component
  const CategoryTreeSelect: React.FC<{
    tree: any[];
    value?: number | undefined;
    onChange: (id?: number) => void;
  }> = ({ tree, value, onChange }) => {
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (id: number) => {
      const next = new Set(expanded);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      setExpanded(next);
    };

    const renderNode = (node: any, level = 0) => {
      const hasChildren = node.children && node.children.length > 0;
      const isExpanded = expanded.has(node.id);
      return (
        <div key={node.id} className={styles.treeNode} style={{ paddingLeft: `${level * 12}px` }}>
          {hasChildren ? (
            <button type="button" className={styles.toggleButton} onClick={() => toggle(node.id)}>
              {isExpanded ? "▾" : "▸"}
            </button>
          ) : (
            <div style={{ width: 20 }} />
          )}
          <label className={styles.nodeLabel}>
            <input
              className={styles.radio}
              type="radio"
              name="product-category"
              checked={value === node.id}
              onChange={() => onChange(node.id)}
            />
            <span>{node.name}</span>
          </label>
          {hasChildren && isExpanded && (
            <div className={styles.children}>
              {node.children.map((ch: any) => renderNode(ch, level + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className={styles.categoryTree}>
        <div className={styles.noCategory}>
          <label>
            <input
              type="radio"
              name="product-category"
              checked={value === undefined || value === null}
              onChange={() => onChange(undefined)}
            />{" "}
            No category
          </label>
        </div>
        {tree.map((n) => renderNode(n))}
      </div>
    );
  };

  const handleDelete = async (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const openCreate = () => {
    setEditingProduct(null);
    setForm({
      name: "",
      description: "",
      price: 0,
      categoryId: undefined,
      sku: "",
      stock: 0,
      images: "",
      status: "active",
    });
    loadCategories();
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      categoryId: p.categoryId ? Number(p.categoryId) : undefined,
      sku: p.sku,
      stock: p.stock,
      images: (p.images || []).join(","),
      status: p.status,
    });
    loadCategories();
    setShowModal(true);
  };

  const loadCategories = async () => {
    try {
      // fetch paginated categories (flat) and convert to tree
      const res = await fetchProductCategories(accessToken, 1, 1000, "");
      const flat = (res && res.data) || [];
      const buildTree = (items: any[]) => {
        const map = new Map<number, any>();
        items.forEach((it) => map.set(it.id, { ...it, children: [] }));
        const roots: any[] = [];
        items.forEach((it) => {
          const node = map.get(it.id);
          if (it.parentId) {
            const parent = map.get(it.parentId);
            if (parent) parent.children.push(node);
            else roots.push(node);
          } else {
            roots.push(node);
          }
        });
        return roots;
      };

      setCategories(buildTree(flat));
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    }
  };

  const handleSaveProduct = async () => {
    try {
      const payload: any = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId || null,
        sku: form.sku,
        stock: Number(form.stock),
        images: form.images ? form.images.split(",").map((s) => s.trim()) : [],
        status: form.status,
      };
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, payload as any);
      } else {
        await productsApi.createProduct(payload as any);
      }
      setShowModal(false);
      await loadProducts();
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Failed to save product");
    }
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        await productsApi.deleteProduct(selectedProduct.id);
        await loadProducts();
        setShowDeleteModal(false);
        setSelectedProduct(null);
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Products</h1>
        <UiButton theme="primary" onClick={openCreate}>
          <Plus size={20} />
          Add Product
        </UiButton>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <UiButton theme="secondary">
          <Filter size={20} />
          Filters
        </UiButton>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productInfo}>
                    {product.images.length > 0 && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                    <span>{product.name}</span>
                  </div>
                </td>
                <td>{product.sku}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`${styles.status} ${styles[product.status]}`}>
                    {product.status}
                  </span>
                </td>
                <td>{product.category?.name || "No category"}</td>
                <td>
                  <div className={styles.actions}>
                    <UiButton theme="secondary" onClick={() => openEdit(product)}>
                      <Edit size={16} />
                    </UiButton>
                    <UiButton theme="warning" onClick={() => handleDelete(product)}>
                      <Trash2 size={16} />
                    </UiButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete Product</h3>
            <p>Are you sure you want to delete "{selectedProduct?.name}"?</p>
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

      {showModal && (
        <Modal
          open={showModal}
          onClose={() => setShowModal(false)}
          title={editingProduct ? "Edit Product" : "Create Product"}
        >
          <div className={styles.productForm}>
            <div className={styles.formRow}>
              <label>Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label>SKU</label>
              <Input
                value={form.sku}
                onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label>Price</label>
              <Input
                type="number"
                value={String(form.price)}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              />
            </div>
            <div className={styles.formRow}>
              <label>Category</label>
              <div>
                <CategoryTreeSelect
                  tree={categories}
                  value={form.categoryId}
                  onChange={(id) => setForm((f) => ({ ...f, categoryId: id }))}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <label>Images (comma-separated URLs)</label>
              <Input
                value={form.images}
                onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
              />
            </div>
            <div className={styles.formRow}>
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className={styles.formActions}>
              <UiButton theme="primary" onClick={handleSaveProduct}>
                Save
              </UiButton>
              <UiButton theme="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </UiButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductsPage;
