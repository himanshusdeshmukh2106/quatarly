const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration with optimizations
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    // Disable minification in dev mode to avoid issues
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
      compress: {
        // Disable optimizations that might break code
        conditionals: false,
        dead_code: false,
      },
      mangle: false,
      output: {
        comments: false,
      },
    },
    // Enable tree shaking
    unstable_allowRequireContext: true,
    // Transform options for JSC - disable experimental features
    getTransformOptions: async () => ({
      transform: {
        // Disable experimental import support - use standard CommonJS
        experimentalImportSupport: false,
        // Enable inline requires for better performance
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    // Add path aliases for cleaner imports
    alias: {
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@utils': './src/utils',
      '@types': './src/types',
      '@hooks': './src/hooks',
      '@context': './src/context',
    },
    // Optimize asset resolution
    assetExts: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ttf', 'otf', 'woff', 'woff2'],
    // Ensure we're resolving the right source extensions
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
