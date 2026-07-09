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
    '^@foodiego/(.*)$': '<rootDir>/packages/$1/src'
  }
};
