import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './ui-site-footer';

test('renders footer and content from README', () => {
  render(<Footer />);
  expect(screen.getByText(/Key Features/i)).toBeInTheDocument();
  expect(screen.getByText(/Quick Start/i)).toBeInTheDocument();
  // assert heading specifically (avoid matching API inside list items)
  expect(screen.getByRole('heading', { name: /API/i })).toBeInTheDocument();
});
