import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "@/src/shared/ui/Checkbox/ui-checkbox";

describe("Checkbox component", () => {
  it("renders without crashing", () => {
    render(<Checkbox />);
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("can be checked and unchecked", async () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("renders with default checked prop", () => {
    render(<Checkbox checked readOnly />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox).toBeChecked();
  });

  it("applies custom className if provided", () => {
    const { container } = render(<Checkbox className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
