import styles from "@/src/shared/ui/Checkbox/input.module.css";
import classNames from "../../lib/classnames/classnames";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Checkbox = ({ className, ...props }: CheckboxProps) => {
  return (
    <input type="checkbox" className={classNames(styles.input, {}, [className || ""])} {...props} />
  );
};

export default Checkbox;
