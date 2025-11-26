import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import Header from "@/src/widgets/header/index";


// 💡 Мокаем next/link
// Storybook не работает с next/link без Next.js, поэтому мы временно подменим
jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

const meta: Meta<typeof Header> = {
  title: "Widgets/Header",
  component: Header,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Header>;

export const Default: Story = {
  args: {},
};
