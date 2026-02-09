import * as React from "react";

import classNames from "@/src/shared/lib/classnames/classnames";
import { LegacyRef } from "react";
import styles from "./ui-table.module.css";

interface PropsTableElement extends React.HTMLAttributes<HTMLTableElement> {
  theme?: string;
  className?: string;
}
const Table = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsTableElement,
    ref: LegacyRef<HTMLTableElement> | undefined,
  ) => (
    <div className={classNames(styles.table_contain, {}, [className])}>
      <table
        ref={ref}
        className={classNames(styles.table, { [styles[theme]]: !!styles[theme] }, [])}
        {...props}
      />
    </div>
  ),
);
Table.displayName = "Table";

interface PropsHTMLTableSectionElement extends React.HTMLAttributes<HTMLTableSectionElement> {
  theme?: string;
  className?: string;
}
const TableHeader = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableSectionElement,
    ref: LegacyRef<HTMLTableSectionElement> | undefined,
  ) => (
    <thead
      ref={ref}
      className={classNames(styles.table_header, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableSectionElement,
    ref: LegacyRef<HTMLTableSectionElement> | undefined,
  ) => (
    <tbody
      ref={ref}
      className={classNames(styles.table_body, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableSectionElement,
    ref: LegacyRef<HTMLTableSectionElement> | undefined,
  ) => (
    <tfoot
      ref={ref}
      className={classNames(styles.table_footer, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableFooter.displayName = "TableFooter";

interface PropsHTMLTableRowElement extends React.HTMLAttributes<HTMLTableRowElement> {
  theme?: string;
  className?: string;
}
const TableRow = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableRowElement,
    ref: LegacyRef<HTMLTableRowElement>,
  ) => (
    <tr
      ref={ref}
      className={classNames(styles.table_row, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

interface PropsHTMLTableCellElement extends React.ThHTMLAttributes<HTMLTableCellElement> {
  theme?: string;
  className?: string;
}
const TableHead = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableCellElement,
    ref: LegacyRef<HTMLTableCellElement>,
  ) => (
    <th
      ref={ref}
      className={classNames(styles.table_head, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableCellElement,
    ref: LegacyRef<HTMLTableCellElement>,
  ) => (
    <td
      ref={ref}
      className={classNames(styles.table_cell, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef(
  (
    { className = "", theme = "", ...props }: PropsHTMLTableCellElement,
    ref: LegacyRef<HTMLTableCellElement>,
  ) => (
    <caption
      ref={ref}
      className={classNames(styles.table_cell, { [styles[theme]]: !!styles[theme] }, [className])}
      {...props}
    />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
