"use client";

import React, { useEffect, useState } from 'react';
import { productsApi } from '@/src/entities/Product/api';
import styles from './public-product.module.css';

export default function PublicProductView({ productId, config }: { productId: string | number | null; config?: any }) {
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', message: '', rating: 5 });

  const showReviews = config?.showReviews !== undefined ? config.showReviews : true;
  const allowReviewSubmission = config?.allowReviewSubmission !== undefined ? config.allowReviewSubmission : true;
  const reviewsLimit = config?.reviewsLimit ? Number(config.reviewsLimit) : undefined;

  useEffect(() => {
    let active = true;
    async function load() {
      if (!productId) return setLoading(false);
      try {
        setLoading(true);
          const p = await productsApi.getProduct(String(productId));
          const r = await productsApi.getProductReviews(String(productId));
          if (!active) return;
          setProduct(p);
          const list = r || [];
          setReviews(reviewsLimit ? list.slice(0, reviewsLimit) : list);
      } catch (err) {
        console.error('PublicProductView load error', err);
        setProduct(null);
        setReviews([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [productId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;
    try {
      const newReview = await productsApi.addProductReview(String(productId), form);
      setReviews((s) => [newReview, ...s].slice(0, reviewsLimit || Infinity));
      setForm({ name: '', email: '', message: '', rating: 5 });
    } catch (err) {
      console.error('Failed to submit review', err);
    }
  };

  if (loading) return <div className={styles.loading}>Loading product...</div>;
  if (!product) return <div className={styles.notfound}>Product not found</div>;

  return (
    <div className={styles.container} data-widget="product-single">
      <div className={styles.header}>
        <h2>{product.name}</h2>
        <div className={styles.price}>${Number(product.price).toFixed(2)}</div>
      </div>
      <div className={styles.body}>
        <div className={styles.images}>
          {product.images?.map((src: string, i: number) => (
            <img key={i} src={src} alt={`${product.name}-${i}`} className={styles.img} />
          ))}
        </div>
        <div className={styles.description}>{product.description}</div>
      </div>

      {showReviews && (
        <div className={styles.reviews}>
          <h3>Reviews</h3>
          {allowReviewSubmission && (
            <form onSubmit={submitReview} className={styles.reviewForm}>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              <textarea placeholder="Message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              <div>
                <label>Rating</label>
                <select value={form.rating} onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}>
                  <option value={5}>5</option>
                  <option value={4}>4</option>
                  <option value={3}>3</option>
                  <option value={2}>2</option>
                  <option value={1}>1</option>
                </select>
              </div>
              <button type="submit">Submit Review</button>
            </form>
          )}

          <div className={styles.reviewsList}>
            {reviews.map((r) => (
              <div key={r.id} className={styles.review}>
                <div className={styles.reviewHeader}>
                  <strong>{r.name}</strong>
                  <span className={styles.rating}>{r.rating}/5</span>
                </div>
                <p>{r.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
