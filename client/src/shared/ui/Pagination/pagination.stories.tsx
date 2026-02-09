import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Pagination from './ui-pagination';

const meta: Meta<typeof Pagination> = {
  title: 'ui/Pagination',
  component: Pagination,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Pagination>;

export const Demo: Story = {
  render: () => {
    function DemoComp() {
      const [p, setP] = useState(1);
      return (
        <div>
          <Pagination page={p} total={105} perPage={10} onChange={(n) => setP(n)} />
          <div style={{ marginTop: 12 }}>Current page: {p}</div>
        </div>
      );
    }
    return <DemoComp />;
  },
};
