import React from "react";
import { Meta, StoryObj } from "@storybook/react";
import styles from "@/src/shared/ui/Button/ui-button.module.css";
import classNames from "@/src/shared/lib/classnames/classnames";
import { ChevronDown, Plus, X } from "lucide-react";
import styless from "@/src/widgets/block_management/index.module.css";

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
          <Button className={styless.close} theme="close">
            <X className={styless.x} />
          </Button>
          <div className={styless.text}>Selected: {choosen}</div>
          <Button theme="warning">Delete</Button>
        </div>
      )}
      {type === "secondary" && (
        <div className={styless.secondary_or_third}>
          <Button theme="third">Open Original</Button>
          <Button theme="third">Open Thumbnail</Button>
          <Button theme="third">Edit</Button>
        </div>
      )}
      {type === "third" && (
        <div className={styles.secondary_or_third}>
          <Button theme="third">
            File <ChevronDown />
          </Button>
          <Button theme="third">
            Author <ChevronDown />
          </Button>
          <Button theme="third">
            Date <ChevronDown />
          </Button>
        </div>
      )}
      <Button theme="third" className={styless.add}>
        <Plus />
        Add
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
