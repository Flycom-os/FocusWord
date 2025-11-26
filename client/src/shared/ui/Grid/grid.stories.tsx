import type { Meta, StoryObj } from '@storybook/react';
import Grid from './ui-grid';

const meta: Meta<typeof Grid> = {
  title: 'ui/Grid',
  component: Grid,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Grid>;

export const Demo: Story = {
  args: {
    cols: 12,
    gap: 12,
    children: (
      <>
        <div style={{ background: '#fff', padding: 8, gridColumn: 'span 4' }}>col span 4</div>
        <div style={{ background: '#fff', padding: 8, gridColumn: 'span 4' }}>col span 4</div>
        <div style={{ background: '#fff', padding: 8, gridColumn: 'span 4' }}>col span 4</div>
      </>
    ),
  },
};
