import { toAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAbstractClient } from '../../src/abstractClient.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

const MOCK_SMART_ACCOUNT_ADDRESS = address.smartAccountAddress;

// Mock the entire viem module
vi.mock('viem', async () => {
  const actual = await vi.importActual('viem');
  return {
    ...actual,
    createClient: vi.fn().mockReturnValue({
      extend: vi.fn().mockReturnValue({
        sendTransaction: vi.fn(),
        sendTransactionBatch: vi.fn(),
        signTransaction: vi.fn(),
        deployContract: vi.fn(),
        writeContract: vi.fn(),
        prepareAbstractTransactionRequest: vi.fn(),
      }),
    }),
    createPublicClient: vi.fn(),
    createWalletClient: vi.fn(),
  };
});

import { createClient, createPublicClient, createWalletClient } from 'viem';

vi.mock('../../src/utils', () => ({
  getSmartAccountAddressFromInitialSigner: vi
    .fn()
    .mockResolvedValue('0x0000000000000000000000000000000000012345'),
}));

import { getSmartAccountAddressFromInitialSigner } from '../../src/utils.js';

describe('createAbstractClient', () => {
  const signer = toAccount(address.signerAddress);
  const mockWalletClient = vi.fn();
  const mockPublicClient = vi.fn();

  beforeEach(() => {
    vi.mocked(createWalletClient).mockReturnValue(mockWalletClient as any);
    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient as any);
  });

  const testAbstractClient = (abstractClient: any, expectedTransport: any) => {
    expect(createClient).toHaveBeenCalledWith({
      account: expect.objectContaining({
        address: MOCK_SMART_ACCOUNT_ADDRESS,
      }),
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      transport: expectedTransport,
    });

    [
      'sendTransaction',
      'sendTransactionBatch',
      'signTransaction',
      'deployContract',
      'writeContract',
      'prepareAbstractTransactionRequest',
    ].forEach((prop) => {
      expect(abstractClient).toHaveProperty(prop);
    });

    expect(getSmartAccountAddressFromInitialSigner).toHaveBeenCalledWith(
      address.signerAddress,
      mockPublicClient,
    );
  };

  it('throws if no transport is provided', () => {
    expect(
      createAbstractClient({
        signer,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      }),
    ).rejects.toThrow();
  });

  it('creates client with default public transport', async () => {
    const mockTransport = vi.fn();
    const mockPublicTransport = expect.any(Function);
    const abstractClient = await createAbstractClient({
      signer,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      transport: mockTransport,
    });

    testAbstractClient(abstractClient, mockPublicTransport);
  });

  it('creates client with custom public transport', async () => {
    const mockTransport = vi.fn();
    const mockPublicTransport = vi.fn();
    const abstractClient = await createAbstractClient({
      signer,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      transport: mockTransport,
      publicTransport: mockPublicTransport,
    });

    testAbstractClient(abstractClient, mockPublicTransport);
  });
});
