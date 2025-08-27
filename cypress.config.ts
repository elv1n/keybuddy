import { devServer } from '@cypress/vite-dev-server';
import { defineConfig } from 'cypress';
import viteConfig from './vite.config';

export default defineConfig({
  component: {
    specPattern: 'cypress/component/**/*.spec.ts',
    supportFile: 'cypress/support/component.ts',
    devServer(devServerConfig) {
      return devServer({
        ...devServerConfig,
        viteConfig,
      });
    },
    video: false,
    viewportWidth: 1000,
    viewportHeight: 660,
    numTestsKeptInMemory: 50,
  },
});
