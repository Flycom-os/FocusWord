import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Notifications, { showToast } from './ui-notifications';
import Button from '@/src/shared/ui/Button/ui-button';

const meta: Meta<typeof Notifications> = {
  title: 'ui/Notifications',
  component: Notifications,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Notifications>;

export const Demo: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 10 }}>
      <Notifications />
      <div style={{ display: 'flex', gap: 8 }}>
        <Button onClick={() => showToast('Default message')}>Default</Button>
        <Button theme="secondary" onClick={() => showToast('Success!', 'success')}>
          Success
        </Button>
        <Button theme="third" onClick={() => showToast('Warning', 'warning')}>
          Warning
        </Button>
        <Button onClick={() => showToast('Error happened', 'error')}>Error</Button>
      </div>
    </div>
  ),
};
