import React from "react";
import { render, screen } from "@testing-library/react";

import { useRouter } from "next/router";
import "@testing-library/jest-dom";
import Header from "@/src/widgets/header/index";

// Мокаем useRouter от next/router, если понадобится
jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Header component", () => {
  it("renders with default username", () => {
    render(<Header />);

    // Проверка текста "Назад"
    expect(screen.getByText("Назад")).toBeInTheDocument();

    // Проверка имени пользователя
    expect(screen.getByText("Global_layout")).toBeInTheDocument();

    // Проверка наличия ChevronLeft
    const leftIcon = screen.getByRole("button", { name: /назад/i }).querySelector("svg");
    expect(leftIcon).toBeInTheDocument();

    // Проверка наличия ChevronDown
    const downIcon = screen.getByText("Global_layout").parentElement?.querySelector("svg");
    expect(downIcon).toBeInTheDocument();
  });

  it("applies passed className", () => {
    const { container } = render(<Header className="test-class" />);
    expect(container.firstChild).toHaveClass("test-class");
  });

  it("navigates to root on link click", () => {
    render(<Header />);
    const link = screen.getByRole("link", { name: /назад/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
