import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./index";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Sidebar", () => {
  it("рендерит все пункты меню", () => {
    render(<Sidebar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Media files")).toBeInTheDocument();
    expect(screen.getByText("Records")).toBeInTheDocument();
    expect(screen.getByText("Add new record")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Pages")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("вызывает router.push при клике на пункт меню", () => {
    const push = jest.fn();
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({ push });
    render(<Sidebar />);
    fireEvent.click(screen.getByText("Media files"));
    expect(push).toHaveBeenCalledWith("/admin/media-files");
  });

  it("скрывает текст при сворачивании и показывает при раскрытии", () => {
    render(<Sidebar />);
    // Клик по кнопке "Hide"
    fireEvent.click(screen.getByText("Hide"));
    // Текст "Home" должен исчезнуть из DOM
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    // Клик по кнопке "Show"
    fireEvent.click(screen.getByText("Show"));
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
