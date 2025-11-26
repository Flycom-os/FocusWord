import React from 'react';
import styles from './ui-grid.module.css';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  gap?: string | number;
}

const Grid = ({ cols = 12, gap = 12, children, className = '', ...rest }: GridProps) => {
  const style: React.CSSProperties = { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap };
  return (
    <div className={`${styles.grid} ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
};

export default Grid;
