import React from 'react';
import { render } from '@testing-library/react';
import Notifications, { showToast } from './ui-notifications';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  ToastContainer: (props: any) => <div data-testid="toast-container" {...props} />,
}));

test('renders ToastContainer', () => {
  const { getByTestId } = render(<Notifications />);
  expect(getByTestId('toast-container')).toBeInTheDocument();
});

test('showToast calls toast.success for success', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { toast } = require('react-toastify');
  showToast('ok', 'success');
  expect(toast.success).toHaveBeenCalled();
});
