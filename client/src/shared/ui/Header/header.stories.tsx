import type { Meta, StoryObj } from '@storybook/react';
import Header from './ui-site-header';

const meta: Meta<typeof Header> = {
  title: 'ui/Header',
  component: Header,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Primary: Story = {};
