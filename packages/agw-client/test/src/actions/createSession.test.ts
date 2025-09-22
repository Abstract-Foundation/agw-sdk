import {
  concatHex,
  createClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseEther,
} from 'viem';
import {
  generatePrivateKey,
  privateKeyToAccount,
  toAccount,
} from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, expect, test, vi } from 'vitest';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { isSmartAccountDeployed } from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/utils.js');

import { readContract, writeContract } from 'viem/actions';

vi.mock('viem/actions', () => ({
  readContract: vi.fn(),
  writeContract: vi.fn(),
}));

import AGWAccountAbi from '../../../src/abis/AGWAccount.js';
import { createSession } from '../../../src/actions/createSession.js';
import { sendTransaction } from '../../../src/actions/sendTransaction.js';
import {
  encodeSession,
  LimitType,
  SessionConfig,
} from '../../../src/sessions.js';

const sessionSigner = privateKeyToAccount(generatePrivateKey());

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('should create a session with module already installed', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  vi.mocked(writeContract).mockResolvedValue('0xmockedTransactionHash');
  vi.mocked(readContract).mockResolvedValue([SESSION_KEY_VALIDATOR_ADDRESS]);

  const session: SessionConfig = {
    signer: sessionSigner.address,
    expiresAt: 1099511627775n,
    callPolicies: [],
    transferPolicies: [],
    feeLimit: {
      limit: parseEther('1'),
      limitType: LimitType.Lifetime,
      period: 0n,
    },
  };

  const { transactionHash } = await createSession(baseClient, publicClient, {
    session,
  });

  expect(transactionHash).toBe('0xmockedTransactionHash');
});

test('should add module and create a session with contract not deployed', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(false);
  vi.mocked(writeContract).mockResolvedValue('0xmockedTransactionHash');
  vi.mocked(readContract).mockResolvedValue([]);

  const session: SessionConfig = {
    signer: sessionSigner.address,
    expiresAt: 1099511627775n,
    callPolicies: [],
    transferPolicies: [],
    feeLimit: {
      limit: parseEther('1'),
      limitType: LimitType.Lifetime,
      period: 0n,
    },
  };

  const { transactionHash } = await createSession(baseClient, publicClient, {
    session,
  });

  expect(transactionHash).toBe('0xmockedTransactionHash');

  expect(writeContract).toHaveBeenCalledWith(baseClient, {
    address: address.smartAccountAddress,
    abi: AGWAccountAbi,
    functionName: 'addModule',
    args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodeSession(session)])],
  });
});

test('should add module and create a session with module not installed', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  vi.mocked(writeContract).mockResolvedValue('0xmockedTransactionHash');
  vi.mocked(readContract).mockResolvedValue([]);

  const session: SessionConfig = {
    signer: sessionSigner.address,
    expiresAt: 1099511627775n,
    callPolicies: [],
    transferPolicies: [],
    feeLimit: {
      limit: parseEther('1'),
      limitType: LimitType.Lifetime,
      period: 0n,
    },
  };

  const { transactionHash } = await createSession(baseClient, publicClient, {
    session,
  });

  expect(transactionHash).toBe('0xmockedTransactionHash');

  expect(writeContract).toHaveBeenCalledWith(baseClient, {
    address: address.smartAccountAddress,
    abi: AGWAccountAbi,
    functionName: 'addModule',

    args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodeSession(session)])],
  });
});
