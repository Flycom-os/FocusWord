import React from 'react';
import styles from './ui-select.module.css';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  theme?: 'primary' | 'secondary';
  options?: { value: string; label: string }[];
  onChange?: (value: string) => void; // Explicitly define onChange to accept string value
}

const Select = ({ label, theme = 'primary', options = [], className = '', onChange, ...rest }: SelectProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  return (
    <div className={`${styles.select_wrap} ${styles[theme]} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.select_box}>
        <select {...rest} className={styles.select} onChange={handleChange}>
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
