import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import styles from "@/src/shared/ui/Button/ui-button.module.css";
import classNames from "@/src/shared/lib/classnames/classnames";

export interface Button extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: VariantsType;
  className?: string;
}
type VariantsType =
  | "primary"
  | "secondary"
  | "third"
  | "warning"
  | "close"
  | "breadcrumb"
  | "mini"
  | "";
const Button = (props: Button) => {
  const { className, children, theme = "primary", type = "button", ...otherProps } = props;
  return (
    <button
      className={classNames(styles.buttonD, { [styles[theme]]: true }, [className || ""])}
      {...otherProps}
    >
      {children}
    </button>
  );
};
import { ChevronDown, Plus, X } from "lucide-react";
import styless from "@/src/widgets/block_management/index.module.css";

interface searchProps {
  type?: VariantssType;
}
type VariantssType = "primary" | "secondary" | "third" | "";
const choosen = 2;
const BlockManagement = ({ type }: searchProps) => {
  return (
    <div className={styless.default}>
      {(type === "primary" || type === "secondary") && (
        <div className={styless.primary_or_secondary}>
          <Button className={styless.close} theme={"close"}>
            <X className={styless.x} />
          </Button>
          <div className={styless.text}>Выбранно: {choosen}</div>
          <Button theme={"warning"}>Удалить</Button>
        </div>
      )}
      {type === "secondary" && (
        <div className={styless.secondary_or_third}>
          <Button theme="third">Открыть оригинал</Button>
          <Button theme="third">Открыть миниатюру</Button>
          <Button theme="third">Редактировать</Button>
        </div>
      )}
      {type === "third" && (
        <div className={styles.secondary_or_third}>
          <Button theme="third">
            Файл <ChevronDown />
          </Button>
          <Button theme="third">
            Автор <ChevronDown />
          </Button>
          <Button theme="third">
            Дата <ChevronDown />
          </Button>
        </div>
      )}
      <Button theme="third" className={styless.add}>
        <Plus />
        Добавить
      </Button>
    </div>
  );
};


const meta: Meta<typeof BlockManagement> = {
  title: "Widgets/BlockManagement",
  component: BlockManagement,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BlockManagement>;

export const Primary: Story = {
  args: {
    type: "primary",
  },
};

export const Secondary: Story = {
  args: {
    type: "secondary",
  },
};

export const Third: Story = {
  args: {
    type: "third",
  },
};

export const Default: Story = {
  args: {
    type: "",
  },
};
