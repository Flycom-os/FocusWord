// .storybook/main.js
const { mergeConfig } = require('vite');
// vite-tsconfig-paths may be published as an ESM module — require(...) can return
// an object with a `default` property. Make sure we get a callable plugin factory.
const _tsconfigPaths = require('vite-tsconfig-paths');
const tsconfigPaths = _tsconfigPaths && (_tsconfigPaths.default || _tsconfigPaths);

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links',
    '@storybook/nextjs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  core: {
    builder: '@storybook/builder-vite', // ЭТО ГЛАВНОЕ — принудительно включаем Vite
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()],
      define: {
        global: 'window',
      },
    });
  },
};