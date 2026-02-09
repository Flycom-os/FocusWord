import React, { useState } from "react";
import { Meta, StoryObj } from "@storybook/react";
import Search from "@/src/widgets/search/index";

// Импортируем CSS, если нет глобального декоратора
import "@/src/widgets/search/index.module.css";
import "@/src/shared/ui/Input/ui-input.module.css";
import "@/src/shared/ui/Button/ui-button.module.css";

// Вспомогательный компонент с моком функции
const SearchWrapper = () => {
  const [value, setValue] = useState("");
  return (
    <Search
      setSearchValue={(val: string) => {
        console.log("Поисковый запрос:", val);
        setValue(val);
      }}
    />
  );
};

const meta: Meta<typeof SearchWrapper> = {
  title: "Widgets/Search",
  component: SearchWrapper,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof SearchWrapper>;

export const Default: Story = {
  args: {},
};
