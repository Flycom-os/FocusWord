import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import UiPageHeader from '@/src/shared/ui/Header/ui-page-header'
const MockedUiPageHeader = ({ title, subTitle = '' }: { title: string; subTitle?: string }) => {
  return (
    <header style={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
      <h1>{title}</h1>
      <nav>
        <a href="admin/media-files">{title}/</a> {' '}
        <a href="/">{subTitle}</a>
      </nav>
    </header>
  );
};

const meta: Meta<typeof MockedUiPageHeader> = {
  title: 'Shared/UiPageHeader',
  component: MockedUiPageHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
};

export default meta;
type Story = StoryObj<typeof MockedUiPageHeader>;

export const Default: Story = {
  args: {
    title: 'Медиафайлы',
    subTitle: 'Главная',
  },
};

export const WithoutSubTitle: Story = {
  args: {
    title: 'Только заголовок',
  },
};
