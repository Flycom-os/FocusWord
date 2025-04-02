import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Button } from "../index";

const meta = {
  title: "ui/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    theme: "primary",
    children: "Primary",
  },
};

export const Secondary: Story = {
  args: {
    theme: "primary",
    children: "Secondary",
  },
};
