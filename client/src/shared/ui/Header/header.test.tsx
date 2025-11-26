import React from 'react';
import { render, screen, within } from '@testing-library/react';
import Header from './ui-site-header';

test('renders header with navigation and actions', () => {
  render(<Header />);
  expect(screen.getByText(/FocusWord/i)).toBeInTheDocument();
  expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
  // check navigation role then ensure individual links are present
  const nav = screen.getByRole('navigation', { name: /Main navigation/i });
  expect(nav).toBeInTheDocument();
  const links = ['Key Features', 'Quick Start', 'Architecture', 'Contributing', 'API', 'License'];
  links.forEach((text) => expect(within(nav).getByText(text)).toBeInTheDocument());
});
