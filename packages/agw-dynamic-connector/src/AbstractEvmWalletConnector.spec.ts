/* eslint-disable @typescript-eslint/no-explicit-any */
import { type EthereumWalletConnectorOpts } from '@dynamic-labs/ethereum-core';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { AbstractEvmWalletConnector } from './AbstractEvmWalletConnector.js';

jest.mock('@dynamic-labs/wallet-connector-core', () => ({
  // @ts-expect-error this is an object so we can use spread type
  ...jest.requireActual('@dynamic-labs/wallet-connector-core'),
  logger: {
    debug: jest.fn(),
  },
}));

const walletConnectorProps: EthereumWalletConnectorOpts = {
  walletBook: {} as any,
  evmNetworks: [],
} as any as EthereumWalletConnectorOpts;

describe('AbstractEvmWalletConnector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findProvider', () => {
    it('should return the provider', () => {
      const connector = new AbstractEvmWalletConnector(walletConnectorProps);
      expect(connector.findProvider()).toBeDefined();
    });
  });
});
