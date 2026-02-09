import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PopUp from './ui-popup';

test('shows popup on hover', () => {
  render(<PopUp content={'hello'} trigger={'hover'}><button>hi</button></PopUp>);
  const btn = screen.getByText('hi');
  fireEvent.mouseEnter(btn);
  expect(screen.getByText('hello')).toBeInTheDocument();
  fireEvent.mouseLeave(btn);
});

test('toggles popup on click', () => {
  render(<PopUp content={'click me'} trigger={'click'}><button>hi</button></PopUp>);
  const btn = screen.getByText('hi');
  fireEvent.click(btn);
  expect(screen.getByText('click me')).toBeInTheDocument();
  fireEvent.click(btn);
});
