module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '70', // Lower version to ensure compatibility
          node: '10',
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
  ],
};
