import type { Meta, StoryObj } from '@storybook/react';
import VideoPlayer from './ui-video';

const meta: Meta<typeof VideoPlayer> = {
  title: 'ui/VideoPlayer',
  component: VideoPlayer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof VideoPlayer>;

export const Demo: Story = {
  args: {
    src: '/sample-video.mp4',
    width: '480px',
    height: '270px',
  },
};
