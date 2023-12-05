// 

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@prisma/(.*)$': '<rootDir>/node_modules/@prisma/client/runtime',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};
