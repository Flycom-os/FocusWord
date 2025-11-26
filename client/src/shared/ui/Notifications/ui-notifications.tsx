import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ui-notifications.module.css';

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'default';

export function showToast(message: string, type: ToastType = 'default', opts?: ToastOptions) {
  const fn = {
    success: toast.success,
    info: toast.info,
    warning: toast.warn,
    error: toast.error,
    default: toast,
  }[type];

  fn(message, { position: 'bottom-right', autoClose: 4000, ...opts });
}

const Notifications = () => {
  return <ToastContainer className={styles.container} />;
};

export default Notifications;
