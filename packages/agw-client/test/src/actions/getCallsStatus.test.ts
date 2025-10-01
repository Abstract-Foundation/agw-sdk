import { createClient, type FormattedTransactionReceipt } from 'viem';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getCallsStatus } from '../../../src/actions/getCallsStatus.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('viem/actions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getTransactionReceipt: vi.fn(),
  };
});

import { getTransactionReceipt } from 'viem/actions';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const MOCK_TX_HASH =
  '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getCallsStatus', () => {
  it('should return pending status when receipt is not found', async () => {
    vi.mocked(getTransactionReceipt).mockResolvedValue(undefined as any);

    const result = await getCallsStatus(baseClient, { id: MOCK_TX_HASH });

    expect(result).toEqual({
      atomic: true,
      chainId: anvilAbstractTestnet.chain.id,
      receipts: undefined,
      status: 'pending',
      id: MOCK_TX_HASH,
      statusCode: 100,
      version: '2.0.0',
    });

    expect(getTransactionReceipt).toHaveBeenCalledWith(baseClient, {
      hash: MOCK_TX_HASH,
    });
  });

  it('should return success status when receipt status is success', async () => {
    const mockReceipt: FormattedTransactionReceipt = {
      blockHash: '0xabc',
      blockNumber: 123n,
      contractAddress: null,
      cumulativeGasUsed: 21000n,
      effectiveGasPrice: 1000000000n,
      from: address.smartAccountAddress,
      gasUsed: 21000n,
      logs: [],
      logsBloom: '0x00',
      status: 'success',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      transactionHash: MOCK_TX_HASH,
      transactionIndex: 0,
      type: 'eip1559',
    };

    vi.mocked(getTransactionReceipt).mockResolvedValue(mockReceipt as any);

    const result = await getCallsStatus(baseClient, { id: MOCK_TX_HASH });

    expect(result).toEqual({
      atomic: true,
      chainId: anvilAbstractTestnet.chain.id,
      receipts: [mockReceipt],
      status: 'success',
      id: MOCK_TX_HASH,
      statusCode: 200,
      version: '2.0.0',
    });
  });

  it('should return failure status when receipt status is reverted', async () => {
    const mockReceipt: FormattedTransactionReceipt = {
      blockHash: '0xabc',
      blockNumber: 123n,
      contractAddress: null,
      cumulativeGasUsed: 21000n,
      effectiveGasPrice: 1000000000n,
      from: address.smartAccountAddress,
      gasUsed: 21000n,
      logs: [],
      logsBloom: '0x00',
      status: 'reverted',
      to: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      transactionHash: MOCK_TX_HASH,
      transactionIndex: 0,
      type: 'eip1559',
    };

    vi.mocked(getTransactionReceipt).mockResolvedValue(mockReceipt as any);

    const result = await getCallsStatus(baseClient, { id: MOCK_TX_HASH });

    expect(result).toEqual({
      atomic: true,
      chainId: anvilAbstractTestnet.chain.id,
      receipts: [mockReceipt],
      status: 'failure',
      id: MOCK_TX_HASH,
      statusCode: 500,
      version: '2.0.0',
    });
  });

  it('should throw InvalidParameterError when id is not hex', async () => {
    await expect(
      getCallsStatus(baseClient, { id: 'not-hex' as any }),
    ).rejects.toThrow();
  });

  it('should handle TransactionReceiptNotFoundError gracefully', async () => {
    const { TransactionReceiptNotFoundError } = await import('viem');

    vi.mocked(getTransactionReceipt).mockRejectedValue(
      new TransactionReceiptNotFoundError({ hash: MOCK_TX_HASH as any }),
    );

    const result = await getCallsStatus(baseClient, { id: MOCK_TX_HASH });

    expect(result).toEqual({
      atomic: true,
      chainId: anvilAbstractTestnet.chain.id,
      receipts: undefined,
      status: 'pending',
      id: MOCK_TX_HASH,
      statusCode: 100,
      version: '2.0.0',
    });
  });

  it('should rethrow other errors from getTransactionReceipt', async () => {
    const mockError = new Error('Network error');
    vi.mocked(getTransactionReceipt).mockRejectedValue(mockError);

    await expect(
      getCallsStatus(baseClient, { id: MOCK_TX_HASH }),
    ).rejects.toThrow('Network error');
  });
});
