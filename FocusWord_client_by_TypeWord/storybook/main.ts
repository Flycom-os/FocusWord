import { StorybookConfig } from '@storybook/react-vite';
import * as path from "path";


const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'), // Убедись, что алиас настроен правильно
    };
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
