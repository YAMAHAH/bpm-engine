module.exports = {
  collectCoverageFrom: ['packages/*/dist/**/*.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 70,
      functions: 70,
      lines: 70,
    },
  },
  moduleFileExtensions: ['js'],
  moduleNameMapper: {
    '^bpm-engine(.*?)$': '<rootDir>/packages/bpm-engine$1/index.js',
  },
  rootDir: __dirname,
  testMatch: ['<rootDir>/packages/*/__tests__/**/*spec.js'],
};
