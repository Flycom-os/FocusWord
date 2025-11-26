import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Checkbox from "@/src/shared/ui/Checkbox/ui-checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "shared/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: {
    checked: false,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <Checkbox {...args} />
      <span>Согласен с условиями</span>
    </label>
  ),
  args: {
    checked: false,
  },
};
