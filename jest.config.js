module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  "moduleNameMapper": {
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@fileHandlers/(.*)$": "<rootDir>/src/file-handlers/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
  }
}