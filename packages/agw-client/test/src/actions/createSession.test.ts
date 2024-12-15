import {
  createClient,
  createPublicClient,
  createWalletClient,
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
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';
vi.mock('../../../src/actions/sendTransaction', () => ({
  sendTransaction: vi.fn(),
}));

import { readContract } from 'viem/actions';

vi.mock('viem/actions', () => ({
  readContract: vi.fn(),
}));

import { createSession } from '../../../src/actions/createSession.js';
import { sendTransaction } from '../../../src/actions/sendTransaction.js';
import { LimitType, SessionConfig } from '../../../src/sessions.js';

const sessionSigner = privateKeyToAccount(generatePrivateKey());

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const signerClient = createWalletClient({
  account: toAccount(address.signerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('should create a session with module already installed', async () => {
  vi.mocked(sendTransaction).mockResolvedValue('0xmockedTransactionHash');
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

  const { transactionHash } = await createSession(
    baseClient,
    signerClient,
    publicClient,
    {
      session,
    },
    false,
  );

  expect(transactionHash).toBe('0xmockedTransactionHash');
});
