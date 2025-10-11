module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-chart-kit|d3-shape|@ernestbies|react-native-vector-icons|react-native-tab-view)/)',
  ],
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  moduleNameMapper: {
    '^react-native-chart-kit$': '<rootDir>/__mocks__/react-native-chart-kit.js',
    '^d3-shape$': '<rootDir>/__mocks__/d3-shape.js',
    '^@ernestbies/react-native-android-sms-listener$': '<rootDir>/__mocks__/sms-listener.js',
    '^react-native-vector-icons/(.*)$': '<rootDir>/__mocks__/react-native-vector-icons.js',
    '^react-native-document-picker$': '<rootDir>/__mocks__/react-native-document-picker.js',
  },
};