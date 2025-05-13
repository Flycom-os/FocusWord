import { UiButton } from "@/src/shared/ui";
import { render, screen } from "@testing-library/react";

describe("classNames", () => {
  test("with only first param", () => {
    render(<UiButton>TEST</UiButton>);
    expect(screen.getByText("TEST")).toBeInTheDocument();
  });
});
