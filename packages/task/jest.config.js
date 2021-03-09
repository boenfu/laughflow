module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'src/test/tsconfig.json',
    },
  },
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  transformIgnorePatterns: ['node_modules'],
  clearMocks: true,
  collectCoverage: true,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
};
