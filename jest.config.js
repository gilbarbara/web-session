module.exports = {
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.js'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  moduleDirectories: ['node_modules', 'src', './'],
  moduleFileExtensions: ['js', 'json'],
  resetMocks: false,
  setupFiles: ['jest-date-mock', 'jest-localstorage-mock'],
  setupFilesAfterEnv: ['<rootDir>/test/__setup__/setupFilesAfterEnv.js'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: { resources: 'usable' },
  testRegex: '/test/.*?\\.(test|spec)\\.js$',
  testURL: 'http://localhost:3000',
  transform: {
    '.*': 'babel-jest'
  }
};
