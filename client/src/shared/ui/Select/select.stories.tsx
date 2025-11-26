import type { Meta, StoryObj } from '@storybook/react';
import Select from './ui-select';

const meta: Meta<typeof Select> = {
  title: 'ui/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Basic: Story = {
  args: {
    label: 'Choose one',
    options: [
      { value: 'a', label: 'Choice A' },
      { value: 'b', label: 'Choice B' },
      { value: 'c', label: 'Choice C' },
    ],
  },
};

export const Secondary: Story = {
  args: {
    label: 'Select (secondary)',
    theme: 'secondary',
    options: [
      { value: '1', label: 'One' },
      { value: '2', label: 'Two' },
    ],
  },
};
