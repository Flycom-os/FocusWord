import React, { useState } from 'react';
import styles from './ui-popup.module.css';

export interface PopUpProps {
  content: React.ReactNode;
  children: React.ReactNode;
  trigger?: 'hover' | 'click';
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const PopUp = ({ content, children, trigger = 'hover', position = 'top' }: PopUpProps) => {
  const [open, setOpen] = useState(false);

  const handlers =
    trigger === 'hover'
      ? {
          onMouseEnter: () => setOpen(true),
          onMouseLeave: () => setOpen(false),
        }
      : {
          onClick: () => setOpen((s) => !s),
        };

  return (
    <div className={styles.wrapper} {...handlers} style={{ position: 'relative', display: 'inline-block' }}>
      {children}
      {open && (
        <div className={`${styles.popup} ${styles[position]}`} role="dialog">
          {content}
          <div className={styles.arrow} />
        </div>
      )}
    </div>
  );
};

export default PopUp;
