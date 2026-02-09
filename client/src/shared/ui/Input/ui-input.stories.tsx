import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Input from "@/src/shared/ui/Input/ui-input"

const meta: Meta<typeof Input> = {
  title: "shared/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Введите текст...",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Primary: Story = {
  args: {
    theme: "primary",
  },
};

export const SecondaryLeftIcon: Story = {
  args: {
    theme: "secondary",
    icon: "left",
  },
};

export const SecondaryRightIcon: Story = {
  args: {
    theme: "secondary",
    icon: "right",
  },
};

export const WithError: Story = {
  args: {
    theme: "primary",
    error: true,
  },
};

export const SecondaryWithErrorAndIcon: Story = {
  args: {
    theme: "secondary",
    icon: "right",
    error: true,
  },
};
