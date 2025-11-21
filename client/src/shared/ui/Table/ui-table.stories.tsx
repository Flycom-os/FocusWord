import React from "react";
import type { Meta, StoryObj } from "@storybook/react";

import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "./ui-table";

// Стили, если Storybook их не подтягивает сам
import "./ui-table.module.css";

const meta: Meta<typeof Table> = {
  title: "Shared/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Пример таблицы</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Имя</TableHead>
          <TableHead>Возраст</TableHead>
          <TableHead>Город</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Анна</TableCell>
          <TableCell>28</TableCell>
          <TableCell>Москва</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Иван</TableCell>
          <TableCell>34</TableCell>
          <TableCell>Санкт-Петербург</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Всего: 2 записи</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};
