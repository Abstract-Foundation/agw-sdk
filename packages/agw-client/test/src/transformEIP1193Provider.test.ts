import { type EIP1193EventMap, type EIP1193Provider } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import * as abstractClientModule from '../../src/abstractClient.js';
import { transformEIP1193Provider } from '../../src/transformEIP1193Provider.js';
import * as utilsModule from '../../src/utils.js';

const listeners: Partial<{
  [K in keyof EIP1193EventMap]: Set<EIP1193EventMap[K]>;
}> = {};

const mockProvider: EIP1193Provider & { randomParam: string } = {
  request: vi.fn(),
  on: vi.fn((event, listener) => {
    if (!listeners[event]) {
      listeners[event] = new Set();
    }
    listeners[event].add(listener);
  }),
  removeListener: vi.fn((event, listener) => {
    if (listeners[event]) {
      listeners[event].delete(listener);
    }
  }),
  randomParam: 'randomParam',
};

describe('transformEIP1193Provider', () => {
  it('should transform the provider', () => {
    const transformedProvider = transformEIP1193Provider({
      provider: mockProvider,
      chain: abstractTestnet,
    });

    expect(transformedProvider.on).toEqual(mockProvider.on);
    expect(transformedProvider.removeListener).toEqual(
      mockProvider.removeListener,
    );
    // Make sure request function has been overridden
    expect(transformedProvider.request).not.toEqual(mockProvider.request);
    // Ensure other params are preserved
    expect((transformedProvider as any).randomParam).toEqual(
      mockProvider.randomParam,
    );
  });

  describe('handler', () => {
    let transformedProvider: EIP1193Provider;

    beforeEach(() => {
      vi.resetAllMocks();
      transformedProvider = transformEIP1193Provider({
        provider: mockProvider,
        chain: abstractTestnet,
      });
    });

    it('should handle eth_accounts method', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        utilsModule,
        'getSmartAccountAddressFromInitialSigner',
      ).mockResolvedValueOnce(mockSmartAccount);

      const result = await transformedProvider.request({
        method: 'eth_accounts',
      });

      expect(result).toEqual([mockSmartAccount, mockAccounts[0]]);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should handle eth_signTransaction method for smart account', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockTransaction = {
        from: mockSmartAccount,
        to: '0xabcd',
        value: '0x1',
      };
      const mockSignedTransaction = '0xsigned';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        signTransaction: vi.fn().mockResolvedValueOnce(mockSignedTransaction),
      } as any);

      const result = await transformedProvider.request({
        method: 'eth_signTransaction',
        params: [mockTransaction as any],
      });

      expect(result).toBe(mockSignedTransaction);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should handle eth_sendTransaction method for smart account', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockTransaction = {
        from: mockSmartAccount,
        to: '0xabcd',
        value: '0x1',
      };
      const mockTxHash = '0xtxhash';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        sendTransaction: vi.fn().mockResolvedValueOnce(mockTxHash),
      } as any);

      const result = await transformedProvider.request({
        method: 'eth_sendTransaction',
        params: [mockTransaction as any],
      });

      expect(result).toBe(mockTxHash);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should pass through other methods to the original provider', async () => {
      const mockMethod = 'eth_blockNumber';
      const mockResult = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockResult);

      const result = await transformedProvider.request({ method: mockMethod });

      expect(result).toBe(mockResult);
      expect(mockProvider.request).toHaveBeenCalledWith({ method: mockMethod });
    });
  });
});
