import React from "react";
import { render, screen } from "@testing-library/react";
import Input from "@/src/shared/ui/Input/ui-input"
import userEvent from "@testing-library/user-event";

describe("Input component", () => {
  it("renders without crashing", () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText("Type here")).toBeInTheDocument();
  });

  it("applies primary theme by default", () => {
    const { container } = render(<Input />);
    expect(container.firstChild).toHaveClass("primary");
  });

  it("applies secondary theme with left icon", () => {
    const { container } = render(<Input theme="secondary" icon="left" />);
    expect(container.firstChild).toHaveClass("secondary");
    expect(container.querySelector("svg")).toBeInTheDocument(); // Иконка Search
  });

  it("shows error styling when error is true", () => {
    const { container } = render(<Input error />);
    expect(container.firstChild).toHaveClass("error");
  });

  it("can type into the input", async () => {
    render(<Input placeholder="Input here" />);
    const input = screen.getByPlaceholderText("Input here") as HTMLInputElement;
    await userEvent.type(input, "Hello");
    expect(input.value).toBe("Hello");
  });
});
