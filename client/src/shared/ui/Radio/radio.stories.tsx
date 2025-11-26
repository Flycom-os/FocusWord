import type { Meta, StoryObj } from '@storybook/react';
import Radio from './ui-radio';

const meta: Meta<typeof Radio> = {
  title: 'ui/Radio',
  component: Radio,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Primary: Story = {
  args: {
    label: 'Option A',
    name: 'radio-demo',
    theme: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    label: 'Option B',
    name: 'radio-demo',
    theme: 'secondary',
  },
};
