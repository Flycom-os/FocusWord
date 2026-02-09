import React from 'react';
import styles from './ui-body.module.css';

export interface BodyProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: string | number;
  padding?: string | number;
}

const Body = ({ children, maxWidth = '1200px', padding = '24px', className = '', ...rest }: BodyProps) => {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div className={`${styles.container} ${className}`} style={{ maxWidth, padding }} {...rest}>
        {children}
      </div>
    </div>
  );
};

export default Body;
