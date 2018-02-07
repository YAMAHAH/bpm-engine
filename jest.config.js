module.exports = {
  collectCoverageFrom: ['packages/*/src/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 80,
      functions: 90,
      lines: 90,
    },
  },
  moduleFileExtensions: ['js'],
  moduleNameMapper: {
    '^jspe(.*?)$': '<rootDir>/packages/jspe$1/index.js',
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/*/__tests__/**/*spec.js'],
};
