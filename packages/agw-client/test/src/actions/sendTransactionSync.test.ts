import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { sendTransactionSync } from '../../../src/actions/sendTransactionSync.js';
import { EOA_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransactionInternal');
vi.mock('../../../src/actions/sendPrivyTransaction');
vi.mock('viem/actions', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    sendRawTransactionSync: vi.fn().mockResolvedValue({
      blockHash: '0x1234',
      blockNumber: 1n,
      transactionHash: '0xmockedSyncHash',
      status: 'success',
    }),
  };
});

import { sendRawTransactionSync } from 'viem/actions';
import { signPrivyTransaction } from '../../../src/actions/sendPrivyTransaction.js';
import { sendTransactionInternal } from '../../../src/actions/sendTransactionInternal.js';

const mockReceipt = {
  blockHash: '0x1234' as `0x${string}`,
  blockNumber: 1n,
  contractAddress: null,
  cumulativeGasUsed: 21000n,
  effectiveGasPrice: 1000000000n,
  from: address.smartAccountAddress,
  gasUsed: 21000n,
  logs: [],
  logsBloom: '0x' as `0x${string}`,
  status: 'success' as const,
  to: '0x5432100000000000000000000000000000000000' as `0x${string}`,
  transactionHash: '0xmockedTransactionHash' as `0x${string}`,
  transactionIndex: 0,
  type: 'eip1559' as const,
};

// Client setup
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

const transaction: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0xabc',
};

describe('sendTransactionSync', () => {
  test('calls sendTransactionInternal with sync callback', async () => {
    vi.mocked(sendTransactionInternal).mockResolvedValue(mockReceipt);
    const receipt = await sendTransactionSync(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      } as any,
      false,
    );

    expect(sendTransactionInternal).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      expect.objectContaining({
        from: zeroAddress,
        to: transaction.to,
        data: transaction.data,
        type: 'eip712',
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      }),
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
      expect.any(Function),
    );
    expect(receipt).toBe(mockReceipt);
  });

  test('passes throwOnReceiptRevert and timeout via callback', async () => {
    vi.mocked(sendTransactionInternal).mockResolvedValue(mockReceipt);
    await sendTransactionSync(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
        throwOnReceiptRevert: false,
        timeout: 5000,
      } as any,
      false,
    );

    // The sendTransactionInternal should receive parameters WITHOUT throwOnReceiptRevert/timeout
    const callArgs = vi.mocked(sendTransactionInternal).mock.calls[0];
    const txParams = callArgs[3] as any;
    expect(txParams.throwOnReceiptRevert).toBeUndefined();
    expect(txParams.timeout).toBeUndefined();
    // But the callback (8th arg) should exist
    expect(callArgs[7]).toBeInstanceOf(Function);
  });

  test('calls signPrivyTransaction for Privy cross-app flow', async () => {
    vi.mocked(signPrivyTransaction).mockResolvedValue('0x01abab');
    vi.mocked(sendRawTransactionSync).mockResolvedValue({
      blockHash: '0x1234',
      blockNumber: 1n,
      transactionHash: '0xmockedSyncHash',
      status: 'success',
    } as any);

    const receipt = await sendTransactionSync(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
      } as any,
      true,
    );

    expect(signPrivyTransaction).toHaveBeenCalledWith(
      baseClient,
      expect.objectContaining(transaction),
    );
    expect(sendRawTransactionSync).toHaveBeenCalledWith(
      publicClient,
      expect.objectContaining({
        serializedTransaction: '0x01abab',
      }),
    );
    expect(receipt).toEqual({
      blockHash: '0x1234',
      blockNumber: 1n,
      transactionHash: '0xmockedSyncHash',
      status: 'success',
    });
  });
});
