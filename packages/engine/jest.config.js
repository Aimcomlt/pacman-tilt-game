/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(t|j)sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@pacman/shared$': '<rootDir>/../shared/src',
  },
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
