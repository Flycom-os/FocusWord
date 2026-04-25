import React from 'react';
import styles from './ui-modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  zIndex?: number;
}

const Modal = ({ open, onClose, title, children, zIndex }: ModalProps) => {
  if (!open) return null;

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" style={{ zIndex: zIndex || 2000 }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          <button className={styles.close} aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
