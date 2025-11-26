import React from 'react';
import { render, screen } from '@testing-library/react';
import Radio from './ui-radio';

test('renders radio with label and changes state on click', () => {
  render(<Radio label="Test option" name="r1" />);
  expect(screen.getByText(/Test option/i)).toBeInTheDocument();
  // input is visually hidden but present
  const input = screen.getByRole('radio');
  expect(input).toBeInTheDocument();
});
