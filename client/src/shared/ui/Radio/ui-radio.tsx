import React from 'react';
import styles from './ui-radio.module.css';

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  theme?: 'primary' | 'secondary';
}

const Radio = ({ label, theme = 'primary', className = '', ...rest }: RadioProps) => {
  return (
    <label className={`${styles.radio_label} ${styles[theme]} ${className}`}>
      <input type="radio" className={styles.radio_input} {...rest} />
      <span className={styles.radio_dot} />
      {label && <span className={styles.radio_text}>{label}</span>}
    </label>
  );
};

export default Radio;
