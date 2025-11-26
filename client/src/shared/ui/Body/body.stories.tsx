import type { Meta, StoryObj } from '@storybook/react';
import Body from './ui-body';

const meta: Meta<typeof Body> = {
  title: 'ui/Body',
  component: Body,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Body>;

export const Demo: Story = {
  args: {
    children: (
      <div style={{ background: '#fff', borderRadius: 8, minHeight: 80, padding: 16 }}>
        Page body content (centered)
      </div>
    ),
  },
};
