import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './ui-pagination';

test('renders pagination and allows navigation', () => {
  const onChange = jest.fn();
  render(<Pagination page={2} total={50} perPage={10} onChange={onChange} />);
  expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '3' }));
  expect(onChange).toHaveBeenCalledWith(3);
});
