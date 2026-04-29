import * as React from "react";
import classNames from "@/src/shared/lib/classnames/classnames";
import { LegacyRef } from "react";
import styles from "./ui-table.module.css";

interface PropsSelectableTableHead extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'onSelectAll'> {
  theme?: string;
  className?: string;
  selectable?: boolean;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  isPartiallySelected?: boolean;
}

const SelectableTableHead = React.forwardRef(
  (
    { 
      className = "", 
      theme = "", 
      selectable = true,
      onSelectAll,
      isAllSelected = false,
      isPartiallySelected = false,
      children,
      ...props 
    }: PropsSelectableTableHead,
    ref: LegacyRef<HTMLTableCellElement>,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLTableCellElement>) => {
      if (selectable && onSelectAll) {
        event.stopPropagation();
        onSelectAll();
      }
      if (props.onClick) {
        props.onClick(event);
      }
    };

    const headClassName = classNames(
      styles.table_head,
      { 
        [styles[theme]]: !!styles[theme],
      }, 
      [className]
    );

    return (
      <th
        ref={ref}
        className={headClassName}
        onClick={handleClick}
        {...props}
      >
        {selectable && (
          <div className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) {
                  input.indeterminate = isPartiallySelected;
                }
              }}
              onChange={(e) => {
                e.stopPropagation();
                if (onSelectAll) {
                  onSelectAll();
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {children}
      </th>
    );
  },
);

SelectableTableHead.displayName = "SelectableTableHead";

export { SelectableTableHead };
