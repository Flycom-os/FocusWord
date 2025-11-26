import React from 'react';
import { render, screen } from '@testing-library/react';
import AudioPlayer from './ui-audio';

test('renders audio play button', () => {
  render(<AudioPlayer src="/sample.mp3" />);
  expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
});
