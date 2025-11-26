import React from 'react';
import styles from './ui-select.module.css';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  theme?: 'primary' | 'secondary';
  options?: { value: string; label: string }[];
}

const Select = ({ label, theme = 'primary', options = [], className = '', ...rest }: SelectProps) => {
  return (
    <div className={`${styles.select_wrap} ${styles[theme]} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.select_box}>
        <select {...rest} className={styles.select}>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} aria-hidden>
          ▾
        </span>
      </div>
    </div>
  );
};

export default Select;
