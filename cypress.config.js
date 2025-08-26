const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'cypress/integration/**/*.spec.ts',
    supportFile: 'cypress/support/index.ts',
    video: false,
    viewportWidth: 1000,
    viewportHeight: 660,
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
  },
});
