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
    "^@eventHandlers/(.*)$": "<rootDir>/src/event-handlers/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
  }
}