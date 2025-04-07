// ui-button.stories.tsx

import type { Meta, StoryObj } from "@storybook/react";
import UiButton from "@/src/shared/ui/Button/ui-button";
import { action } from "@storybook/addon-actions";

const meta: Meta<typeof UiButton> = {
  title: "ui/Button",
  component: UiButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    theme: {
      control: { type: "select" },
      options: ["primary", "secondary", "third", "warning", "close", "breadcrumb", "mini", ""],
    },
    onClick: { action: "clicked" }, // автоматический лог в Storybook actions tab
  },
};
console.log('ui');

export default meta;
type Story = StoryObj<typeof UiButton>;

export const Primary: Story = {
  args: {
    theme: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    theme: "secondary",
    children: "Secondary Button",
  },
};

export const Disabled: Story = {
  args: {
    theme: "primary",
    children: "Disabled Button",
    disabled: true,
  },
};

export const WithAction: Story = {
  args: {
    theme: "primary",
    children: "Click Me",
    onClick: action("Button clicked"), // лог в Storybook actions
  },
};
