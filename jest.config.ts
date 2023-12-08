// // 

const unitTestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client',
  },
  globals: {
    'ts-jest': {
      diagnostics: false,
    },
  },
};

const integrationTestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@prisma/client$': '<rootDir>/node_modules/@prisma/client',
  },
};

export default process.env.TEST_TYPE === 'integration' ? integrationTestConfig : unitTestConfig;




// const unitTestConfig = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   moduleNameMapper: {
//   '^@prisma/(.*)$': '<rootDir>/node_modules/@prisma/client/$1',
//   },
//   globals: {
//     'ts-jest': {
//       diagnostics: false,
//     },
//   },
// };

// const integrationTestConfig = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   setupFilesAfterEnv: ['./jest.setup.ts'],
// };

// export default process.env.TEST_TYPE === 'integration' ? integrationTestConfig : unitTestConfig;






// module.exports = {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   moduleNameMapper: {
//     '^@prisma/(.*)$': '<rootDir>/node_modules/@prisma/client/runtime',
//   },
//   globals: {
//     'ts-jest': {
//       diagnostics: false,
//     },
//   },
// };

// export default {
//   preset: 'ts-jest',
//   testEnvironment: 'node',
//   setupFilesAfterEnv: ['./jest.setup.ts'],
// };
