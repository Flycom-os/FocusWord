import React from "react";
import { render, screen } from "@testing-library/react";

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

describe("Table component", () => {
  it("renders table with header, body, and footer", () => {
    render(
      <Table>
        <TableCaption>Test Table</TableCaption>
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
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Всего: 1 запись</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    );

    // Проверяем, что заголовок таблицы отображается
    expect(screen.getByText("Имя")).toBeInTheDocument();
    expect(screen.getByText("Возраст")).toBeInTheDocument();
    expect(screen.getByText("Город")).toBeInTheDocument();

    // Проверяем, что данные отображаются
    expect(screen.getByText("Анна")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("Москва")).toBeInTheDocument();

    // Проверяем Caption
    expect(screen.getByText("Test Table")).toBeInTheDocument();

    // Проверяем Footer
    expect(screen.getByText("Всего: 1 запись")).toBeInTheDocument();
  });

  it("applies custom class names", () => {
    const { container } = render(
      <Table className="custom-table">
        <TableBody>
          <TableRow className="custom-row">
            <TableCell className="custom-cell">Контент</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(container.querySelector(".custom-table")).toBeInTheDocument();
    expect(container.querySelector(".custom-row")).toBeInTheDocument();
    expect(container.querySelector(".custom-cell")).toBeInTheDocument();
  });

  it("renders empty table with no crashing", () => {
    render(<Table />);
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
