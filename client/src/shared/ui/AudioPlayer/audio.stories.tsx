import type { Meta, StoryObj } from '@storybook/react';
import AudioPlayer from './ui-audio';

const meta: Meta<typeof AudioPlayer> = {
  title: 'ui/AudioPlayer',
  component: AudioPlayer,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AudioPlayer>;

export const Demo: Story = {
  args: {
    src: '/sample-audio.mp3',
    theme: 'primary',
  },
};
