import React from 'react';
import { render, screen } from '@testing-library/react';
import Modal from './ui-modal';

test('does not render when closed', () => {
  const { container } = render(<Modal open={false} onClose={() => {}} title="T" />);
  expect(container).toBeEmptyDOMElement();
});

test('renders when open with title', () => {
  render(<Modal open={true} onClose={() => {}} title="T" />);
  expect(screen.getByText('T')).toBeInTheDocument();
});
