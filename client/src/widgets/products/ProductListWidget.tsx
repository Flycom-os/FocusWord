"use client";

import React, { useEffect, useState } from "react";
import { productsApi } from "@/src/entities/Product/api";
import styles from "./product-list.module.css";

interface Props {
  config?: {
    limit?: number;
    showPagination?: boolean;
    categoryId?: number;
    search?: string;
    title?: string;
  };
}

export default function ProductListWidget({ config = {} }: Props) {
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(config.limit || 10);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await productsApi.getProducts({
          page,
          limit,
          search: config.search,
          categoryId: config.categoryId,
        });
        if (!active) return;
        if (res && res.data) {
          setProducts(res.data);
          setTotal(res.total || 0);
        } else if (Array.isArray(res)) {
          setProducts(res);
          setTotal(res.length);
        } else {
          setProducts([]);
          setTotal(0);
        }
      } catch (err) {
        console.error("ProductListWidget load error", err);
        setProducts([]);
        setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [page, limit, config.search, config.categoryId]);

  if (loading) return <div className={styles.loading}>Loading products...</div>;

  return (
    <div className={styles.container} data-widget="products-list">
      {config.title && <h3 className={styles.title}>{config.title}</h3>}
      <div className={styles.grid}>
        {products.map((p) => (
          <div key={p.id} className={styles.card}>
            {p.images && p.images[0] && (
              <img src={p.images[0]} alt={p.name} className={styles.image} />
            )}
            <div className={styles.info}>
              <div className={styles.name}>{p.name}</div>
              <div className={styles.price}>${Number(p.price).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>

      {config.showPagination && (
        <div className={styles.pagination}>
          <button onClick={() => setPage((s) => Math.max(1, s - 1))} disabled={page === 1}>
            Prev
          </button>
          <span>
            {page} / {Math.max(1, Math.ceil(total / limit))}
          </span>
          <button onClick={() => setPage((s) => s + 1)} disabled={page >= Math.ceil(total / limit)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
