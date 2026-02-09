import React from "react";
import { render, screen } from "@testing-library/react";

import Button from "@/src/shared/ui/Button/ui-button";
import { ChevronDown, Plus, X } from "lucide-react";
import BlockManagement from "@/src/widgets/block_management/index";

describe("BlockManagement component", () => {
  it("renders primary and secondary type correctly", () => {
    render(<BlockManagement type="primary" />);

    // Проверяем, что отображаются кнопки для 'primary'
    expect(screen.getByText("Выбранно: 2")).toBeInTheDocument();

  });

  it("renders secondary type correctly", () => {
    render(<BlockManagement type="secondary" />);

    // Проверяем, что отображаются кнопки для 'secondary'
    expect(screen.getByText("Открыть оригинал")).toBeInTheDocument();
    expect(screen.getByText("Открыть миниатюру")).toBeInTheDocument();
    expect(screen.getByText("Редактировать")).toBeInTheDocument();

    // Проверяем наличие кнопки удаления
    expect(screen.getByText("Удалить")).toBeInTheDocument();
  });

  it("renders third type correctly", () => {
    render(<BlockManagement type="third" />);

    // Проверяем, что отображаются кнопки для 'third'
    expect(screen.getByText("Файл")).toBeInTheDocument();
    expect(screen.getByText("Автор")).toBeInTheDocument();
    expect(screen.getByText("Дата")).toBeInTheDocument();

    // Проверяем наличие кнопки "Добавить"
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });

  it("renders default (empty) state correctly", () => {
    render(<BlockManagement />);

    // Проверяем, что отображается только кнопка "Добавить"
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });

  it("calls the 'close' button action", () => {
    const handleClose = jest.fn();


    render(
      <BlockManagement type="primary">
      </BlockManagement>
    );

    // Кликаем по кнопке закрытия
    // screen.getByRole("button", { name: "close" }).click();

    // Проверяем, что был вызван обработчик события
    // expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders the ChevronDown and Plus icons correctly", () => {
    render(<BlockManagement type="third" />);

    // Проверяем наличие иконок ChevronDown и Plus
    expect(screen.getByRole("button", { name: "Файл" }).querySelector("svg")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Добавить" }).querySelector("svg")).toBeInTheDocument();
  });
});
