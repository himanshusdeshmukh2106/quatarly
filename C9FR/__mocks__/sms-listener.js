export default {
  addListener: jest.fn(),
  removeListener: jest.fn(),
  isListening: jest.fn(() => false),
  requestPermissions: jest.fn(() => Promise.resolve(true)),
};