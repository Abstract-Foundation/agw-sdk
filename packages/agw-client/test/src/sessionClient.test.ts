import { toAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAbstractClient } from '../../src/abstractClient.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

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

import {
  createClient,
  createPublicClient,
  createWalletClient,
  parseEther,
  toFunctionSelector,
} from 'viem';

vi.mock('../../src/utils', () => ({
  getSmartAccountAddressFromInitialSigner: vi
    .fn()
    .mockResolvedValue('0x0000000000000000000000000000000000012345'),
}));

import { toSessionClient } from '../../src/sessionClient.js';
import { LimitType, LimitZero } from '../../src/sessions.js';
import { SessionConfig } from '../../src/sessions.js';
import { getSmartAccountAddressFromInitialSigner } from '../../src/utils.js';

const MOCK_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const session: SessionConfig = {
  signer: address.sessionSignerAddress,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limit: parseEther('1'),
    limitType: LimitType.Lifetime,
    period: 0n,
  },
  callPolicies: [
    {
      selector: toFunctionSelector('function mint(address,uint256)'),
      target: MOCK_CONTRACT_ADDRESS,
      constraints: [],
      maxValuePerUse: 0n,
      valueLimit: LimitZero,
    },
  ],
  transferPolicies: [],
};

describe('createSessionClient', () => {
  const signer = toAccount(address.signerAddress);
  const sessionSigner = toAccount(address.sessionSignerAddress);
  const mockWalletClient = vi.fn();
  const mockPublicClient = vi.fn();

  beforeEach(() => {
    vi.mocked(createWalletClient).mockReturnValue(mockWalletClient as any);
    vi.mocked(createPublicClient).mockReturnValue(mockPublicClient as any);
  });

  const testSessionClient = (sessionClient: any, expectedTransport: any) => {
    expect(createClient).toHaveBeenCalledWith({
      account: toAccount(address.smartAccountAddress),
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      transport: expectedTransport,
    });

    ['sendTransaction', 'writeContract'].forEach((prop) => {
      expect(sessionClient).toHaveProperty(prop);
    });

    expect(getSmartAccountAddressFromInitialSigner).not.toHaveBeenCalled();
  };

  it('creates client with custom transport', async () => {
    const mockTransport = expect.any(Function);
    const mockReadTransport = vi.fn();
    const abstractClient = await createAbstractClient({
      signer,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      address: address.smartAccountAddress,
      transport: mockTransport,
      publicTransport: mockReadTransport,
    });

    const sessionClient = toSessionClient({
      client: abstractClient,
      signer: toAccount(address.sessionSignerAddress),
      session,
    });

    testSessionClient(sessionClient, mockTransport);
  });
});
