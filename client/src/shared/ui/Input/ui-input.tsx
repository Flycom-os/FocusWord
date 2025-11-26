import React from "react";
import styles from "@/src/shared/ui/Input/ui-input.module.css";
import { Search } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  theme?: VariantsType;
  icon?: VatiantsIcon;
  error?: boolean;
}

type VariantsType = "primary" | "secondary";
type VatiantsIcon = "right" | "left";
const Input = ({ className, children, theme, error = false, icon, ...otherProps }: InputProps) => {
  const InputClassName = `${styles.input_global} ${theme === "secondary" ? styles.secondary : styles.primary} ${error ? styles.error : ""} ${className}`;
  return (
    <div className={InputClassName}>
      {theme === "secondary" && icon === "left" && (
        <span className={styles.span}>
          <Search color="#003d6c" size={16} />
        </span>
      )}
      <input className={styles.input} {...otherProps} />
      {theme === "secondary" && icon === "right" && (
        <span className={styles.span}>
          <Search color="#003d6c" size={16} />
        </span>
      )}
    </div>
  );
};
export default Input;
