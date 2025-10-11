module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  rules: {
    // React Hooks rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // TypeScript rules
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // Code quality rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'max-lines': ['warn', { 
      max: 300, 
      skipBlankLines: true, 
      skipComments: true 
    }],
    'max-lines-per-function': ['warn', { 
      max: 50, 
      skipBlankLines: true, 
      skipComments: true 
    }],
    
    // React Native specific
    'react-native/no-inline-styles': 'warn',
    'react-native/no-unused-styles': 'warn',
  },
};
