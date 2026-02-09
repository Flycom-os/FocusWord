import React from 'react';
import { render, screen } from '@testing-library/react';
import Body from './ui-body';

test('renders body container and children', () => {
  render(<Body><div>inside</div></Body>);
  expect(screen.getByText('inside')).toBeInTheDocument();
});
