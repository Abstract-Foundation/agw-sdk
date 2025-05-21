import {
  Address,
  type EIP1193EventMap,
  type EIP1193Provider,
  hexToBytes,
  parseEther,
  serializeTypedData,
  toHex,
} from 'viem';
import {
  generatePrivateKey,
  parseAccount,
  privateKeyToAccount,
} from 'viem/accounts';
import { abstractTestnet } from 'viem/chains';
import { getGeneralPaymasterInput } from 'viem/zksync';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

import * as abstractClientModule from '../../src/abstractClient.js';
import { agwCapabilitiesV2, SendCallsParams } from '../../src/eip5792.js';
import { transformEIP1193Provider } from '../../src/transformEIP1193Provider.js';
import * as utilsModule from '../../src/utils.js';
import { exampleTypedData } from '../fixtures.js';

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

    it('should handle eth_requestAccounts method', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        utilsModule,
        'getSmartAccountAddressFromInitialSigner',
      ).mockResolvedValueOnce(mockSmartAccount);

      const result = await transformedProvider.request({
        method: 'eth_requestAccounts',
      });

      expect(result).toEqual([mockSmartAccount, mockAccounts[0]]);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts',
      });
    });

    it('should return empty array if accounts are not found', async () => {
      (mockProvider.request as Mock).mockResolvedValueOnce(null);
      const result = await transformedProvider.request({
        method: 'eth_accounts',
      });
      expect(result).toEqual([]);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
    });

    it('should return empty array if accounts are not found', async () => {
      (mockProvider.request as Mock).mockResolvedValueOnce(null);
      const result = await transformedProvider.request({
        method: 'eth_requestAccounts',
      });
      expect(result).toEqual([]);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_requestAccounts',
      });
    });

    it('throws an error if accounts are not found', async () => {
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockTransaction = {
        from: mockSmartAccount,
        to: '0xabcd',
        value: '0x1',
      };

      (mockProvider.request as Mock).mockResolvedValueOnce([]);

      await expect(
        transformedProvider.request({
          method: 'eth_signTransaction',
          params: [mockTransaction as any],
        }),
      ).rejects.toThrowError('Account not found');
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

    it('should default to using providerHandleRequest for eth_sendTransaction', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockTransaction = {
        from: mockAccounts[0],
        to: '0xabcd',
        value: '0x1',
      };
      const mockTxHash = '0xtxHashFromProvider';

      (mockProvider.request as Mock)
        .mockResolvedValueOnce(mockAccounts)
        .mockResolvedValueOnce(mockTxHash);

      const result = await transformedProvider.request({
        method: 'eth_sendTransaction',
        params: [mockTransaction as any],
      });
      expect(result).toBe(mockTxHash);
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

    it('handles paymaster params correctly', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const paymasterInput = getGeneralPaymasterInput({
        innerInput: '0x1234',
      });
      const mockTransaction = {
        from: mockSmartAccount,
        to: '0xabcd',
        value: '0x1',
        eip712Meta: {
          paymasterParams: {
            paymaster: '0x7A3f9E34C8F2E7c4d0F6d5e9B2B4E3B1C9D0A1B2',
            paymasterInput: Array.from(hexToBytes(paymasterInput)),
          },
        },
      };
      const mockTxHash = '0xtxhash';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      const mockSendTransaction = vi.fn().mockResolvedValueOnce(mockTxHash);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        sendTransaction: mockSendTransaction,
      } as any);

      const result = await transformedProvider.request({
        method: 'eth_sendTransaction',
        params: [mockTransaction as any],
      });

      expect(result).toBe(mockTxHash);
      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_accounts',
      });
      expect(mockSendTransaction).toHaveBeenCalledWith({
        ...mockTransaction,
        paymaster: '0x7A3f9E34C8F2E7c4d0F6d5e9B2B4E3B1C9D0A1B2',
        paymasterInput: paymasterInput,
      });
    });

    it('should transform personal_sign to typed signature for smart account', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockMessage = 'Please sign this message to verify your account';

      const mockHexSignature = '0xababcd';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        signMessage: vi.fn().mockResolvedValueOnce(mockHexSignature),
      } as any);

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      const result = await transformedProvider.request({
        method: 'personal_sign',
        params: [toHex(mockMessage), mockSmartAccount as any],
      });

      expect(result).toBe(mockHexSignature);
    });

    it('should pass through personal_sign signature to original provider for signer wallet', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockMessage = 'Please sign this message to verify your account';

      const mockHexSignature = '0xababcd';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      (mockProvider.request as Mock).mockResolvedValueOnce(mockHexSignature);

      const result = await transformedProvider.request({
        method: 'personal_sign',
        params: [toHex(mockMessage), mockAccounts[0] as any],
      });

      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'personal_sign',
        params: [toHex(mockMessage), mockAccounts[0]],
      });

      expect(result).toBe(mockHexSignature);
    });

    it('should throw an error on personal_sign if there are not accounts', async () => {
      const mockAccounts = [];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockMessage = 'Please sign this message to verify your account';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      await expect(
        transformedProvider.request({
          method: 'personal_sign',
          params: [toHex(mockMessage), mockSmartAccount as any],
        }),
      ).rejects.toThrowError('Account not found');
    });

    it('should transform eth_signTypedData_v4 to typed signature for smart account', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockMessage = serializeTypedData(exampleTypedData);

      const mockHexSignature = '0xababcd';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        signTypedData: vi.fn().mockResolvedValueOnce(mockHexSignature),
      } as any);

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      const result = await transformedProvider.request({
        method: 'eth_signTypedData_v4',
        params: [mockSmartAccount as any, mockMessage],
      });

      expect(result).toBe(mockHexSignature);
    });

    it('should pass through eth_signTypedData_v4 to original provider for signer wallet', async () => {
      const mockAccounts = ['0x742d35Cc6634C0532925a3b844Bc454e4438f44e'];
      const mockMessage = serializeTypedData(exampleTypedData);

      const mockHexSignature = '0xababcd';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      (mockProvider.request as Mock).mockResolvedValueOnce(mockHexSignature);

      const result = await transformedProvider.request({
        method: 'eth_signTypedData_v4',
        params: [mockAccounts[0] as any, mockMessage],
      });

      expect(mockProvider.request).toHaveBeenNthCalledWith(2, {
        method: 'eth_signTypedData_v4',
        params: [
          mockAccounts[0],
          `{"domain":{"name":"Ether Mail","version":"1","chainId":11124,"verifyingContract":"0xcccccccccccccccccccccccccccccccccccccccc"},"message":{"contents":"Hello Bob","from":{"name":"Alice","wallet":"0x0000000000000000000000000000000000001234"},"to":{"name":"Bob","wallet":"0x0000000000000000000000000000000000005678"}},"primaryType":"Mail","types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Mail":[{"name":"from","type":"Person"},{"name":"to","type":"Person"},{"name":"contents","type":"string"}],"Person":[{"name":"name","type":"string"},{"name":"wallet","type":"address"}]}}`,
        ],
      });

      expect(result).toBe(mockHexSignature);
    });

    it('should throw an error on eth_signTypedData_v4 if there are not accounts', async () => {
      const mockAccounts = [];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const mockMessage = serializeTypedData(exampleTypedData);

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      await expect(
        transformedProvider.request({
          method: 'eth_signTypedData_v4',
          params: [mockSmartAccount as any, mockMessage],
        }),
      ).rejects.toThrowError('Account not found');
    });

    it('should pass through other methods to the original provider', async () => {
      const mockMethod = 'eth_blockNumber';
      const mockResult = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockResult);

      const result = await transformedProvider.request({ method: mockMethod });

      expect(result).toBe(mockResult);
      expect(mockProvider.request).toHaveBeenCalledWith({ method: mockMethod });
    });

    it('should handle wallet_getCapabilities', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      const result = await transformedProvider.request({
        method: 'wallet_getCapabilities',
        params: [mockSmartAccount as any],
      });

      expect(result).toBe(agwCapabilitiesV2);
    });
    it('should pass through wallet_getCapabilities to base client when called with external signer', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      const result = await transformedProvider.request({
        method: 'wallet_getCapabilities',
        params: [mockAccounts[0] as any],
      });

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_getCapabilities',
        params: [mockAccounts[0] as any],
      });
    });
    it('should throw an error on wallet_getCapabilities if there are not accounts', async () => {
      const mockAccounts = [];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const calls: SendCallsParams['calls'] = [
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          data: '0x12345678',
        },
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          value: toHex(parseEther('0.01')),
        },
      ];
      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      await expect(
        transformedProvider.request({
          method: 'wallet_getCapabilities',
          params: [mockSmartAccount as any],
        }),
      ).rejects.toThrowError('Account not found');
    });
    it('should call abstract client sendBatchTransactions with wallet_sendCalls', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

      const mockSignedTransaction = '0xsigned';

      const calls: SendCallsParams['calls'] = [
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          data: '0x12345678',
        },
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          value: toHex(parseEther('0.01')),
        },
      ];

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        sendTransactionBatch: vi
          .fn()
          .mockResolvedValueOnce(mockSignedTransaction),
        account: parseAccount(mockSmartAccount),
      } as any);
      const result = await transformedProvider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0',
            from: mockSmartAccount,
            calls,
          },
        ],
      });

      expect(result).toBe(mockSignedTransaction);
    });
    it('should call abstract client sendBatchTransactions with wallet_sendCalls v2.0.0', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';

      const mockSignedTransaction = '0xsigned';

      const calls: SendCallsParams['calls'] = [
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          data: '0x12345678',
        },
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          value: toHex(parseEther('0.01')),
        },
      ];

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        sendTransactionBatch: vi
          .fn()
          .mockResolvedValueOnce(mockSignedTransaction),
        account: parseAccount(mockSmartAccount),
      } as any);
      const result = await transformedProvider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '2.0.0',
            from: mockSmartAccount,
            chainId: toHex(abstractTestnet.id),
            calls,
          },
        ],
      });

      expect(result).toStrictEqual({
        id: mockSignedTransaction,
      });
    });
    it('should pass wallet_sendCalls through to base client when called with external signer', async () => {
      const mockAccounts: Address[] = [
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      ];

      const mockSignedTransaction = '0xsigned';

      const calls: SendCallsParams['calls'] = [
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          data: '0x12345678',
        },
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          value: toHex(parseEther('0.01')),
        },
      ];

      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);
      vi.spyOn(
        abstractClientModule,
        'createAbstractClient',
      ).mockResolvedValueOnce({
        sendTransactionBatch: vi
          .fn()
          .mockResolvedValueOnce(mockSignedTransaction),
      } as any);
      const result = await transformedProvider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0',
            from: mockAccounts[0],
            calls,
          },
        ],
      });

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'wallet_sendCalls',
        params: [
          {
            version: '1.0',
            from: mockAccounts[0],
            calls,
          },
        ],
      });
    });
    it('should throw an error on wallet_sendCalls if there are not accounts', async () => {
      const mockAccounts = [];
      const mockSmartAccount = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
      const calls: SendCallsParams['calls'] = [
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          data: '0x12345678',
        },
        {
          to: privateKeyToAccount(generatePrivateKey()).address,
          value: toHex(parseEther('0.01')),
        },
      ];
      (mockProvider.request as Mock).mockResolvedValueOnce(mockAccounts);

      await expect(
        transformedProvider.request({
          method: 'wallet_sendCalls',
          params: [
            {
              version: '1.0',
              from: mockSmartAccount,
              calls,
            },
          ],
        }),
      ).rejects.toThrowError('Account not found');
    });
    it('should pass transform wallet_getCallsStatus to eth_getTransactionReceipt', async () => {
      const mockTxHash = '0xtxhash';

      await transformedProvider.request({
        method: 'wallet_getCallsStatus',
        params: [mockTxHash],
      });

      expect(mockProvider.request).toHaveBeenCalledWith({
        method: 'eth_getTransactionReceipt',
        params: [mockTxHash],
      });
    });
  });
});
