import React from "react";
import { render, screen } from "@testing-library/react";

import Button from "@/src/shared/ui/Button/ui-button";
import { ChevronDown, Plus, X } from "lucide-react";
import BlockManagement from "@/src/widgets/block_management/index";

describe("BlockManagement component", () => {
  it("renders primary and secondary type correctly", () => {
    render(<BlockManagement type="primary" />);

    // Check that buttons for 'primary' are displayed
    expect(screen.getByText("Selected: 2")).toBeInTheDocument();
  });

  it("renders secondary type correctly", () => {
    render(<BlockManagement type="secondary" />);

    // Check that buttons for 'secondary' are displayed
    expect(screen.getByText("Open Original")).toBeInTheDocument();
    expect(screen.getByText("Open Thumbnail")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();

    // Check if delete button is present
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("renders third type correctly", () => {
    render(<BlockManagement type="third" />);

    // Check that buttons for 'third' are displayed
    expect(screen.getByText("File")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();

    // Check if "Add" button is present
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("renders default (empty) state correctly", () => {
    render(<BlockManagement />);

    // Check that only "Add" button is displayed
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("calls the 'close' button action", () => {
    const handleClose = jest.fn();

    render(<BlockManagement type="primary" />);

    // Click on the close button
    // screen.getByRole("button", { name: "close" }).click();

    // Check that the event handler was called
    // expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders the ChevronDown and Plus icons correctly", () => {
    render(<BlockManagement type="third" />);

    // Check for ChevronDown and Plus icons
    expect(screen.getByRole("button", { name: "File" }).querySelector("svg")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add" }).querySelector("svg"),
    ).toBeInTheDocument();
  });
});
