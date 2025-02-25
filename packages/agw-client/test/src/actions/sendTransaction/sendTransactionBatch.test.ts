import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { afterEach, beforeEach, describe, expect, it, test, vi } from 'vitest';

import { sendTransactionBatch } from '../../../../src/actions/sendTransactionBatch.js';
import { EOA_VALIDATOR_ADDRESS } from '../../../../src/constants.js';
import { anvilAbstractTestnet } from '../../../anvil.js';
import { address } from '../../../constants.js';

vi.mock('../../../../src/utils.js');
vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    encodeFunctionData: vi.fn().mockReturnValue('0xmockedEncodedData'),
  };
});

import { encodeFunctionData } from 'viem';

vi.mock('../../../../src/actions/sendTransactionInternal');
vi.mock('../../../../src/actions/sendPrivyTransaction');

import { sendPrivyTransaction } from '../../../../src/actions/sendPrivyTransaction.js';
import { sendTransactionInternal } from '../../../../src/actions/sendTransactionInternal.js';

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
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0xabc',
};

const transaction2: ZksyncTransactionRequestEIP712 = {
  to: '0x1234500000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x4321',
  value: 1000n,
};

const transaction3: ZksyncTransactionRequestEIP712 = {
  to: '0x1234500000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x4321',
  value: 2000n,
};

describe('sendTransactionBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendTransactionInternal).mockResolvedValue(
      '0xmockedTransactionHash',
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should throw if no calls are provided', async () => {
    await expect(
      sendTransactionBatch(baseClient, signerClient, publicClient, {
        calls: [],
      } as any),
    ).rejects.toThrow('No calls provided');
  });

  it('sendTransactionBatch calls sendTransactionInternal correctly', async () => {
    (encodeFunctionData as any)
      .mockReturnValueOnce('0xbatchCalldata')
      .mockReturnValueOnce('0xdeploymentCalldata');

    const expectedCalls = [
      {
        target: transaction1.to,
        allowFailure: false,
        value: BigInt(0),
        callData: transaction1.data,
      },
      {
        target: transaction2.to,
        allowFailure: false,
        value: BigInt(1000),
        callData: transaction2.data,
      },
      {
        target: transaction3.to,
        allowFailure: false,
        value: BigInt(2000),
        callData: transaction3.data,
      },
    ];

    const batchCallABI = [
      {
        name: 'batchCall',
        type: 'function',
        inputs: [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' },
            ],
          },
        ],
        outputs: [],
      },
    ];

    const transactionHash = await sendTransactionBatch(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1, transaction2, transaction3],
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
      } as any,
    );

    expect(encodeFunctionData).toHaveBeenCalledWith({
      abi: batchCallABI,
      args: [expectedCalls],
    });

    expect(sendTransactionInternal).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      expect.objectContaining({
        to: baseClient.account.address,
        data: '0xbatchCalldata',
        type: 'eip712',
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
        value: BigInt(3000),
      }),
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
    );
    expect(transactionHash).toBe('0xmockedTransactionHash');
  });

  it('should pass through additional args to sendTransactionInternal', async () => {
    (encodeFunctionData as any).mockReturnValueOnce('0xbatchCalldata');

    const expectedCalls = [
      {
        target: transaction1.to,
        allowFailure: false,
        value: BigInt(0),
        callData: transaction1.data,
      },
      {
        target: transaction2.to,
        allowFailure: false,
        value: BigInt(1000),
        callData: transaction2.data,
      },
    ];

    const batchCallABI = [
      {
        name: 'batchCall',
        type: 'function',
        inputs: [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' },
            ],
          },
        ],
        outputs: [],
      },
    ];

    const transactionHash = await sendTransactionBatch(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: [transaction1, transaction2],
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
        gas: 1000000n,
        maxFeePerGas: 100000000000n,
        maxPriorityFeePerGas: 100000000000n,
      } as any,
    );

    expect(encodeFunctionData).toHaveBeenCalledWith({
      abi: batchCallABI,
      args: [expectedCalls],
    });

    expect(sendTransactionInternal).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      expect.objectContaining({
        to: address.smartAccountAddress,
        data: '0xbatchCalldata',
        type: 'eip712',
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
        value: BigInt(1000),
        gas: 1000000n,
        maxFeePerGas: 100000000000n,
        maxPriorityFeePerGas: 100000000000n,
      }),
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
    );
    expect(transactionHash).toBe('0xmockedTransactionHash');
  });
});

describe('sendTransactionBatch with isPrivyCrossApp', () => {
  it('should call sendPrivyTransaction', async () => {
    vi.mocked(sendPrivyTransaction).mockResolvedValue('0x01234');

    const transactionHash = await sendTransactionBatch(
      baseClient,
      signerClient,
      publicClient,
      {
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        calls: [transaction1, transaction2],
      } as any,
      true,
    );

    expect(sendPrivyTransaction).toHaveBeenCalledWith(baseClient, {
      paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
      calls: [transaction1, transaction2],
    });

    expect(transactionHash).toBe('0x01234');
  });
});
