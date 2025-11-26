import React from 'react';
import { render, screen } from '@testing-library/react';
import Select from './ui-select';

test('renders select component and options', () => {
  render(<Select label="Test select" options={[{ value: 'x', label: 'X' }]} />);
  expect(screen.getByText(/Test select/i)).toBeInTheDocument();
  expect(screen.getByRole('combobox')).toBeInTheDocument();
});
