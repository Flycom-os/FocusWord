import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Search from "@/src/widgets/search/index"
import "@testing-library/jest-dom";

describe("Search component", () => {
  it("renders input and button", () => {
    render(<Search setSearchValue={() => {}} />);

    // Проверка наличия поля ввода и кнопки
    expect(screen.getByPlaceholderText("Введите текст...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Поиск" })).toBeInTheDocument();
  });

  it("updates input value on user typing", () => {
    render(<Search setSearchValue={() => {}} />);

    const input = screen.getByPlaceholderText("Введите текст...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test value" } });

    expect(input.value).toBe("test value");
  });

  it("calls setSearchValue with correct input on button click", () => {
    const mockSetSearchValue = jest.fn();
    render(<Search setSearchValue={mockSetSearchValue} />);

    const input = screen.getByPlaceholderText("Введите текст...");
    const button = screen.getByRole("button", { name: "Поиск" });

    fireEvent.change(input, { target: { value: "query" } });
    fireEvent.click(button);

    expect(mockSetSearchValue).toHaveBeenCalledTimes(1);
    expect(mockSetSearchValue).toHaveBeenCalledWith("query");
  });
});
