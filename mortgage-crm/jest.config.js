export default {
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80
    }
  },
  testMatch: ['**/tests/**/*.test.js'],
  transform: {}
};
