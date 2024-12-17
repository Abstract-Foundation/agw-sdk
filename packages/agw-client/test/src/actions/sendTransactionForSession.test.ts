import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { isSmartAccountDeployed } from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/utils.js');
vi.mock('../../../src/actions/sendTransactionInternal', () => ({
  sendTransactionInternal: vi.fn().mockResolvedValue('0xmockedTransactionHash'),
}));
vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    encodeFunctionData: vi.fn().mockReturnValue('0xmockedEncodedData'),
  };
});

import { sendTransactionForSession } from '../../../src/actions/sendTransactionForSession.js';
import { sendTransactionInternal } from '../../../src/actions/sendTransactionInternal.js';
import {
  encodeSessionWithPeriodIds,
  getPeriodIdsForTransaction,
  LimitType,
  LimitZero,
  SessionConfig,
} from '../../../src/sessions.js';

// Client setup
const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const signerClient = createWalletClient({
  account: toAccount(address.sessionSignerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const transaction1: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234578',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0xabc',
};

const transaction2: ZksyncTransactionRequestEIP712 = {
  to: '0x1234500000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x4321',
  value: 1000n,
};

const session: SessionConfig = {
  signer: signerClient.account.address,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limit: parseEther('1'),
    limitType: LimitType.Lifetime,
    period: 0n,
  },
  callPolicies: [
    {
      selector: '0x1234578',
      target: '0x5432100000000000000000000000000000000000',
      constraints: [],
      maxValuePerUse: 0n,
      valueLimit: LimitZero,
    },
  ],
  transferPolicies: [],
};

describe('sendTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendTransactionInternal).mockResolvedValue(
      '0xmockedTransactionHash',
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should call sendTransactionInternal with correct arguments', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
    await sendTransactionForSession(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction1,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      },
      session,
    );
    expect(sendTransactionInternal).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
        to: transaction1.to,
        from: transaction1.from,
        data: transaction1.data,
        type: 'eip712',
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
      },
      SESSION_KEY_VALIDATOR_ADDRESS,
      false,
      {
        [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(
          session,
          getPeriodIdsForTransaction({
            sessionConfig: session,
            target: transaction1.to,
            selector: transaction1.data,
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
          }),
        ),
      },
    );
  });

  it('should call throw if AGW is not deployed', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(false);
    await expect(
      sendTransactionForSession(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction1,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        },
        session,
      ),
    ).rejects.toThrow('Smart account not deployed');
  });

  it('should call throw if to field is not set', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
    await expect(
      sendTransactionForSession(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction1,
          to: undefined,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        },
        session,
      ),
    ).rejects.toThrow('Transaction to field is not specified');
  });
});
