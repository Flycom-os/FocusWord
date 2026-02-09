import React from 'react';
import { render, screen } from '@testing-library/react';
import Grid from './ui-grid';

test('renders grid content', () => {
  render(<Grid><div>one</div><div>two</div></Grid>);
  expect(screen.getByText('one')).toBeInTheDocument();
  expect(screen.getByText('two')).toBeInTheDocument();
});
