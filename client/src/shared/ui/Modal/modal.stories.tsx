import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import Modal from './ui-modal';
import Button from '@/src/shared/ui/Button/ui-button';

const meta: Meta<typeof Modal> = {
  title: 'ui/Modal',
  component: Modal,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Modal>;

export const Example: Story = {
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(true);
      return (
        <div>
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Demo modal">
            <p>This is a demo modal content. Use for dialogs and confirmation UIs.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button theme="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button>Confirm</Button>
            </div>
          </Modal>
        </div>
      );
    };

    return <Demo />;
  },
};
