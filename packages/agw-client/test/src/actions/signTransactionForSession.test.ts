import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
} from 'viem';
import { toAccount } from 'viem/accounts';
import {
  ChainEIP712,
  type SignTransactionReturnType,
  ZksyncTransactionRequestEIP712,
} from 'viem/zksync';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { signTransaction } from '../../../src/actions/signTransaction.js';
import { signTransactionForSession } from '../../../src/actions/signTransactionForSession.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import {
  encodeSessionWithPeriodIds,
  getPeriodIdsForTransaction,
  LimitType,
  LimitZero,
  type SessionConfig,
} from '../../../src/sessions.js';
import type { CustomPaymasterHandler } from '../../../src/types/customPaymaster.js';
import { isSmartAccountDeployed } from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/utils.js');
vi.mock('../../../src/actions/signTransaction.js', () => ({
  signTransaction: vi.fn().mockResolvedValue('0xmockedSignedTransaction'),
}));

const FIXED_NOW = 1_700_000_000_000;

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

const transaction: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x01234578',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0xabc',
};

const session: SessionConfig = {
  signer: signerClient.account.address,
  expiresAt: BigInt(Math.floor(FIXED_NOW / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limit: parseEther('1'),
    limitType: LimitType.Lifetime,
    period: 0n,
  },
  callPolicies: [
    {
      selector: '0x01234578',
      target: '0x5432100000000000000000000000000000000000',
      constraints: [],
      maxValuePerUse: 0n,
      valueLimit: LimitZero,
    },
  ],
  transferPolicies: [],
};

describe('signTransactionForSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(FIXED_NOW);
    vi.mocked(signTransaction).mockResolvedValue(
      '0xmockedSignedTransaction' as SignTransactionReturnType,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls signTransaction with the expected session hook data', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);

    const result = await signTransactionForSession(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      },
      session,
    );

    expect(signTransaction).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      },
      SESSION_KEY_VALIDATOR_ADDRESS,
      {
        [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(
          session,
          getPeriodIdsForTransaction({
            sessionConfig: session,
            target: transaction.to,
            selector: transaction.data,
            timestamp: BigInt(Math.floor(FIXED_NOW / 1000)),
          }),
        ),
      },
      undefined,
    );
    expect(result).toBe('0xmockedSignedTransaction');
  });

  it('forwards a custom paymaster handler to signTransaction', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
    const customPaymasterHandler: CustomPaymasterHandler = async () => ({
      paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
      paymasterInput: '0xdeadbeef',
    });

    await signTransactionForSession(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      },
      session,
      customPaymasterHandler,
    );

    expect(signTransaction).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      expect.any(Object),
      SESSION_KEY_VALIDATOR_ADDRESS,
      expect.any(Object),
      customPaymasterHandler,
    );
  });

  it('throws when the smart account is not deployed', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(false);

    await expect(
      signTransactionForSession(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        },
        session,
      ),
    ).rejects.toThrow('Smart account not deployed');

    expect(signTransaction).not.toHaveBeenCalled();
  });

  it('throws when the transaction to field is not specified', async () => {
    vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);

    await expect(
      signTransactionForSession(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          to: undefined,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        },
        session,
      ),
    ).rejects.toThrow('Transaction to field is not specified');

    expect(signTransaction).not.toHaveBeenCalled();
  });
});
