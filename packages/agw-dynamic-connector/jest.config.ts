import { Config } from 'jest';

// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/nx-api/jest/documents/overview#global-setupteardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;
const esmModules = ['@simplewebauthn', '@wagmi', 'wagmi'];

const config: Config = {
  preset: 'ts-jest',
  displayName: '@dynamic-labs-connectors/abstract-global-wallet',
  transformIgnorePatterns: [
    `node_modules/(?!(?:.pnpm/)?(${esmModules.join('|')}))`,
  ],
  moduleFileExtensions: ['ts', 'js', 'html'],
  testEnvironment: 'node',
};

export default config;
