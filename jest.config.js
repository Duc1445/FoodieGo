export default {
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'artifacts/coverage',
  coverageReporters: ['json', 'html', 'text'],
  collectCoverageFrom: [
    'apps/**/src/domain/**/*.js',
    'apps/**/src/application/**/*.js'
  ],
  coverageThreshold: {
    'apps/**/src/domain/**/*.js': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'apps/**/src/application/**/*.js': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  moduleNameMapper: {
    '^@foodiego/tracing$': '<rootDir>/packages/otel/src',
    '^@foodiego/platform-sdk$': '<rootDir>/packages/platform-sdk/index.js',
    '^@foodiego/contracts/(.*)$': '<rootDir>/packages/contracts/$1',
    '^@foodiego/(.*)$': '<rootDir>/packages/$1/src'
  }
};
