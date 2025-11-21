import React from 'react';

// Мок для process
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {
      NODE_ENV: 'development',
    },
  };
}

// Мок для Jest
declare const jest: any;
if (typeof jest === 'undefined') {
  (window as any).jest = {
    fn: () => () => {},
    mock: () => {},
    spyOn: () => ({
      mockImplementation: () => {},
      mockReturnValue: () => {},
    }),
  };
}

// Глобальный доступ к React
(window as any).React = React;

import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
