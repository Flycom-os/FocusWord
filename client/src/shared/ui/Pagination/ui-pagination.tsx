import React from 'react';
import styles from './ui-pagination.module.css';

export interface PaginationProps {
  page: number;
  total: number;
  perPage?: number;
  onChange: (page: number) => void;
  theme?: 'primary' | 'secondary';
}

const range = (start: number, end: number) => {
  const out: number[] = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
};

const Pagination = ({ page, total, perPage = 10, onChange, theme = 'primary' }: PaginationProps) => {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  const pages = range(start, end);

  return (
    <div className={`${styles.pagination} ${styles[theme]}`} role="navigation" aria-label="pagination">
      <button
        className={styles.btn}
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ‹
      </button>

      {start > 1 && (
        <button className={styles.btn} onClick={() => onChange(1)} aria-label={`Page 1`}>
          1
        </button>
      )}

      {start > 2 && <span className={styles.ellipsis}>…</span>}

      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === page ? styles.active : ''}`}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
        >
          {p}
        </button>
      ))}

      {end < totalPages - 1 && <span className={styles.ellipsis}>…</span>}

      {end < totalPages && (
        <button className={styles.btn} onClick={() => onChange(totalPages)} aria-label={`Page ${totalPages}`}>
          {totalPages}
        </button>
      )}

      <button
        className={styles.btn}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        ›
      </button>
    </div>
  );
};

export default Pagination;
