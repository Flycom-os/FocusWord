import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Search from "@/src/widgets/search/index"
import "@testing-library/jest-dom";

describe("Search component", () => {
  it("renders input and button", () => {
    render(<Search setSearchValue={() => {}} />);

    // Check presence of input and keyboard-hint button
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Search shortcut/i })).toBeInTheDocument();
  });

  it("updates input value on user typing", () => {
    render(<Search setSearchValue={() => {}} />);

    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test value" } });

    expect(input.value).toBe("test value");
  });

  it("calls setSearchValue with correct input on button click", () => {
    const mockSetSearchValue = jest.fn();
    render(<Search setSearchValue={mockSetSearchValue} />);

    const input = screen.getByPlaceholderText("Search");
    const button = screen.getByRole('button', { name: /Search shortcut/i });
    fireEvent.change(input, { target: { value: "query" } });
    // clicking the small shortcut button should trigger search
    fireEvent.click(button);
    expect(mockSetSearchValue).toHaveBeenCalledTimes(1);
    expect(mockSetSearchValue).toHaveBeenCalledWith("query");

    // pressing Enter should also trigger
    fireEvent.change(input, { target: { value: 'enter-query' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(mockSetSearchValue).toHaveBeenCalledWith('enter-query');
  });
});
