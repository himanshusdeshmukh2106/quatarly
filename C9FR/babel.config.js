module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // Remove unused imports (keep console.error and console.warn)
    ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
  env: {
    production: {
      plugins: [
        // Remove console.log in production
        ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
        // Optimize imports
        ['babel-plugin-transform-imports', {
          'react-native-vector-icons': {
            transform: 'react-native-vector-icons/dist/${member}',
            preventFullImport: true,
          },
        }],
      ],
    },
  },
};
