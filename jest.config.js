// jest.config.js
export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    modulePaths: ['<rootDir>/src'],
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1',
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    collectCoverageFrom: [
      'src/**/*.{ts,tsx}',
      '!src/main.tsx',
      '!src/**/*.d.ts',
      '!src/**/*.stories.tsx'
    ],
    coverageReporters: ['text', 'lcov']
  }