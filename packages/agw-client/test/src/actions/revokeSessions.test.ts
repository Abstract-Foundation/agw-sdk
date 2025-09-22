import {
  createClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  Hash,
  http,
  parseEther,
} from 'viem';
import {
  generatePrivateKey,
  privateKeyToAccount,
  toAccount,
} from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransaction', () => ({
  sendTransaction: vi.fn(),
}));

import { readContract, writeContract } from 'viem/actions';

vi.mock('viem/actions', () => ({
  readContract: vi.fn(),
  writeContract: vi.fn(),
}));

import { SessionKeyValidatorAbi } from '../../../src/abis/SessionKeyValidator.js';
import { revokeSessions } from '../../../src/actions/revokeSessions.js';
import { sendTransaction } from '../../../src/actions/sendTransaction.js';
import {
  getSessionHash,
  LimitType,
  SessionConfig,
} from '../../../src/sessions.js';

const sessionSigner = privateKeyToAccount(generatePrivateKey());

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('revokeSessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(writeContract).mockResolvedValue('0xmockedTransactionHash');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test.each([
    {
      session: {
        signer: sessionSigner.address,
        expiresAt: 1099511627775n,
        callPolicies: [],
        transferPolicies: [],
        feeLimit: {
          limit: parseEther('1'),
          limitType: LimitType.Lifetime,
          period: 0n,
        },
      },
      descriptor: 'single session as object',
    },
    {
      session: [
        {
          signer: sessionSigner.address,
          expiresAt: 1099511627775n,
          callPolicies: [],
          transferPolicies: [],
          feeLimit: {
            limit: parseEther('1'),
            limitType: LimitType.Allowance,
            period: 0n,
          },
        },
        {
          signer: sessionSigner.address,
          expiresAt: 1099511628775n,
          callPolicies: [],
          transferPolicies: [],
          feeLimit: {
            limit: parseEther('1'),
            limitType: LimitType.Lifetime,
            period: 0n,
          },
        },
      ],
      descriptor: 'multiple sessions as objects',
    },
    {
      session:
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      descriptor: 'single session as hash',
    },
    {
      session: [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xabababababababababababababababababababababababababababababababab',
      ],
      descriptor: 'multiple sessions as hashes',
    },
    {
      session: [
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        {
          signer: sessionSigner.address,
          expiresAt: 1099511628775n,
          callPolicies: [],
          transferPolicies: [],
          feeLimit: {
            limit: parseEther('1'),
            limitType: LimitType.Lifetime,
            period: 0n,
          },
        },
      ],
      descriptor: 'mix of sessions as hashes and objects',
    },
  ])(
    'should revoke $descriptor',
    async ({
      session,
    }: {
      session: SessionConfig | Hash | (SessionConfig | Hash)[];
    }) => {
      vi.mocked(readContract).mockResolvedValue([]);

      const { transactionHash } = await revokeSessions(baseClient, {
        session,
      });

      const sessionHashes: `0x${string}`[] =
        typeof session === 'string'
          ? [session as Hash]
          : Array.isArray(session)
            ? session.map((session) => {
                if (typeof session === 'string') {
                  return session as Hash;
                }
                return getSessionHash(session);
              })
            : [getSessionHash(session)];

      expect(transactionHash).toBe('0xmockedTransactionHash');

      expect(writeContract).toHaveBeenCalledWith(baseClient, {
        address: SESSION_KEY_VALIDATOR_ADDRESS,
        abi: SessionKeyValidatorAbi,
        args: [sessionHashes],
        functionName: 'revokeKeys',
      });
    },
  );
});
