import type { Meta, StoryObj } from '@storybook/react';
import PopUp from './ui-popup';
import Button from '@/src/shared/ui/Button/ui-button';

const meta: Meta<typeof PopUp> = {
  title: 'ui/PopUp',
  component: PopUp,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof PopUp>;

export const Hover: Story = {
  args: {
    content: 'Tooltip message',
    children: <Button>Hover me</Button>,
    trigger: 'hover',
    position: 'top',
  },
};

export const Click: Story = {
  args: {
    content: 'Popup content, clickable',
    children: <Button>Click me</Button>,
    trigger: 'click',
    position: 'bottom',
  },
};
