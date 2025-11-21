import { StorybookConfig } from '@storybook/react-vite';
import * as path from "path";


const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/nextjs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/src': path.resolve(__dirname, '../src'), // Убедись, что алиас настроен правильно
      };
    }
    
    // Добавляем настройки для React
    config.define = {
      ...config.define,
      'process.env.NODE_ENV': JSON.stringify('development'),
      'global': 'window',
    };
    
    return config;
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
