import {
  createClient,
  createPublicClient,
  createWalletClient,
  erc20Abi,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { sendCalls } from '../../../src/actions/sendCalls.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransactionBatch');

import { sendTransactionBatch } from '../../../src/actions/sendTransactionBatch.js';

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

const transaction1: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
};

const transaction2: ZksyncTransactionRequestEIP712 = {
  to: '0x1234500000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x4321',
  value: 1000n,
};

describe('sendCalls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendTransactionBatch).mockResolvedValue(
      '0xmockedTransactionHash',
    );
  });

  it('should call sendTransactionBatch and return id', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [transaction1, transaction2],
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1, transaction2],
      },
      false,
      undefined,
    );

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should pass isPrivyCrossApp flag to sendTransactionBatch', async () => {
    const result = await sendCalls(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      } as any,
      true,
    );

    expect(sendTransactionBatch).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      },
      true,
      undefined,
    );

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should pass customPaymasterHandler to sendTransactionBatch', async () => {
    const mockPaymasterHandler = vi.fn();

    const result = await sendCalls(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      } as any,
      false,
      mockPaymasterHandler,
    );

    expect(sendTransactionBatch).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      },
      false,
      mockPaymasterHandler,
    );

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should accept capabilities with optional flags', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [transaction1],
      capabilities: {
        atomicBatch: {
          supported: true,
          optional: true,
        },
      },
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      },
      false,
      undefined,
    );

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should accept supported non-optional capabilities', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [transaction1],
      capabilities: {
        atomicBatch: {
          supported: true,
          optional: false,
        },
      },
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1],
      },
      false,
      undefined,
    );

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should throw UnsupportedNonOptionalCapabilityError for unsupported non-optional capability', async () => {
    await expect(
      sendCalls(baseClient, signerClient, publicClient, {
        calls: [transaction1],
        capabilities: {
          unsupportedCapability: {
            optional: false,
          },
        },
      } as any),
    ).rejects.toThrow('non-optional capability');

    expect(sendTransactionBatch).not.toHaveBeenCalled();
  });

  it('should allow unsupported capabilities if they are optional', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [transaction1],
      capabilities: {
        unsupportedCapability: {
          optional: true,
        },
      },
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalled();

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should support atomic capability', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [transaction1],
      capabilities: {
        atomic: {
          status: 'supported',
          optional: false,
        },
      },
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalled();

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });

  it('should work with abi-based calls', async () => {
    const result = await sendCalls(baseClient, signerClient, publicClient, {
      calls: [
        {
          to: '0xabcdef0123456789abcdef0123456789abcdef01',
          abi: erc20Abi,
          functionName: 'transfer',
          args: ['0x5432100000000000000000000000000000000000', 1000n],
        },
      ],
    } as any);

    expect(sendTransactionBatch).toHaveBeenCalled();

    expect(result).toEqual({
      id: '0xmockedTransactionHash',
    });
  });
});
