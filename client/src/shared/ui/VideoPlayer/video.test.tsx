import React from 'react';
import { render, screen } from '@testing-library/react';
import VideoPlayer from './ui-video';

test('renders video player controls', () => {
  render(<VideoPlayer src="/demo.mp4" />);
  expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument();
});
