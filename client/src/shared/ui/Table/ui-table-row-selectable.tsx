import * as React from "react";
import classNames from "@/src/shared/lib/classnames/classnames";
import { LegacyRef } from "react";
import styles from "./ui-table.module.css";

interface PropsSelectableTableRow extends Omit<React.HTMLAttributes<HTMLTableRowElement>, 'onSelect'> {
  theme?: string;
  className?: string;
  selected?: boolean;
  focused?: boolean;
  selectable?: boolean;
  onSelect?: (event: React.MouseEvent<HTMLTableRowElement>) => void;
  checkboxColumn?: boolean;
}

const SelectableTableRow = React.forwardRef(
  (
    { 
      className = "", 
      theme = "", 
      selected = false,
      focused = false,
      selectable = true,
      onSelect,
      checkboxColumn = true,
      children,
      ...props 
    }: PropsSelectableTableRow,
    ref: LegacyRef<HTMLTableRowElement>,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
      if (selectable && onSelect) {
        onSelect(event);
      }
      if (props.onClick) {
        props.onClick(event);
      }
    };

    const rowClassName = classNames(
      styles.table_row,
      { 
        [styles[theme]]: !!styles[theme],
        [styles.selected]: selected,
        [styles.focused]: focused,
        [styles.selectable]: selectable,
      }, 
      [className]
    );

    return (
      <tr
        ref={ref}
        className={rowClassName}
        onClick={handleClick}
        tabIndex={selectable ? 0 : -1}
        {...props}
      >
        {checkboxColumn && selectable && (
          <td className={styles.checkboxCell}>
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => {
                e.stopPropagation();
                if (onSelect) {
                  onSelect(e as any);
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </td>
        )}
        {children}
      </tr>
    );
  },
);

SelectableTableRow.displayName = "SelectableTableRow";

export { SelectableTableRow };
