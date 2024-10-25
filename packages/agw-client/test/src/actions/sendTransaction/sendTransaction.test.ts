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
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import AccountFactoryAbi from '../../../../src/abis/AccountFactory.js';
import {
  sendTransaction,
  sendTransactionBatch,
} from '../../../../src/actions/sendTransaction.js';
import {
  BATCH_CALLER_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
  VALIDATOR_ADDRESS,
} from '../../../../src/constants.js';
import {
  getInitializerCalldata,
  isSmartAccountDeployed,
} from '../../../../src/utils.js';
import { anvilAbstractTestnet } from '../../../anvil.js';
import { address } from '../../../constants.js';

vi.mock('../../../../src/utils.js');
vi.mock('../../../../src/actions/sendTransactionInternal', () => ({
  sendTransactionInternal: vi.fn().mockResolvedValue('0xmockedTransactionHash'),
}));
vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    encodeFunctionData: vi.fn().mockReturnValue('0xmockedEncodedData'),
  };
});

import { encodeFunctionData } from 'viem';

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

  test.each([
    {
      isDeployed: false,
      expectedTo: SMART_ACCOUNT_FACTORY_ADDRESS,
      expectedData: '0xmockedEncodedData',
      shouldCallEncodeFunctionData: true,
    },
    {
      isDeployed: true,
      expectedTo: '0x5432100000000000000000000000000000000000',
      expectedData: '0x1234',
      shouldCallEncodeFunctionData: false,
    },
  ])(
    'sendTransaction calls sendTransactionInternal correctly when isDeployed is $isDeployed',
    async ({
      isDeployed,
      expectedTo,
      expectedData,
      shouldCallEncodeFunctionData,
    }) => {
      vi.mocked(isSmartAccountDeployed).mockResolvedValue(isDeployed);
      vi.mocked(getInitializerCalldata).mockReturnValue(
        '0xmockedInitializerCallData',
      );

      const transactionHash = await sendTransaction(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction1,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        } as any,
        false,
      );

      if (shouldCallEncodeFunctionData) {
        const salt = keccak256(toBytes(address.signerAddress));
        expect(encodeFunctionData).toHaveBeenCalledWith({
          abi: AccountFactoryAbi,
          functionName: 'deployAccount',
          args: [salt, '0xmockedInitializerCallData'],
        });
      } else {
        expect(encodeFunctionData).not.toHaveBeenCalled();
      }

      expect(sendTransactionInternal).toHaveBeenCalledWith(
        baseClient,
        signerClient,
        publicClient,
        expect.objectContaining({
          to: expectedTo,
          data: expectedData,
          type: 'eip712',
          paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
          paymasterInput: '0xabc',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        }),
        !isDeployed,
        false,
      );
      expect(transactionHash).toBe('0xmockedTransactionHash');
    },
  );
});

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

  test.each([
    {
      isDeployed: false,
      expectedTo: SMART_ACCOUNT_FACTORY_ADDRESS,
      encodeFunctionDataCallCount: 2,
      expectedData: '0xdeploymentCalldata',
    },
    {
      isDeployed: true,
      expectedTo: BATCH_CALLER_ADDRESS,
      encodeFunctionDataCallCount: 1,
      expectedData: '0xbatchCalldata',
    },
  ])(
    'sendTransactionBatch calls sendTransactionInternal correctly when isDeployed is $isDeployed',
    async ({
      isDeployed,
      expectedTo,
      encodeFunctionDataCallCount,
      expectedData,
    }) => {
      vi.mocked(isSmartAccountDeployed).mockResolvedValue(isDeployed);
      vi.mocked(getInitializerCalldata).mockReturnValue(
        '0xmockedInitializerCallData',
      );
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
        } as any,
      );

      expect(encodeFunctionData).toHaveBeenCalledTimes(
        encodeFunctionDataCallCount,
      );

      const firstEncodeFunctionDataCall = (
        encodeFunctionData as any
      ).mock.calls.find((call) => !call[0].functionName);
      if (firstEncodeFunctionDataCall) {
        expect(firstEncodeFunctionDataCall[0].abi).toEqual(batchCallABI);
        expect(firstEncodeFunctionDataCall[0].args).toEqual([expectedCalls]);
      }

      if (!isDeployed) {
        // Verify that getInitializerCalldata is called with the correct arguments
        expect(getInitializerCalldata).toHaveBeenCalledWith(
          address.signerAddress,
          VALIDATOR_ADDRESS,
          {
            target: BATCH_CALLER_ADDRESS,
            allowFailure: false,
            value: 1000n,
            callData: '0xbatchCalldata',
          },
        );
        // Verify that the 2nd encodeFunctionData is called with the correct arguments
        const secondEncodeFunctionDataCall = (
          encodeFunctionData as any
        ).mock.calls.find((call) => call[0].functionName === 'deployAccount');
        if (secondEncodeFunctionDataCall) {
          expect(secondEncodeFunctionDataCall[0].abi).toEqual(
            AccountFactoryAbi,
          );
          expect(secondEncodeFunctionDataCall[0].functionName).toEqual(
            'deployAccount',
          );
          expect(secondEncodeFunctionDataCall[0].args).toEqual([
            keccak256(toBytes(address.signerAddress)),
            '0xmockedInitializerCallData',
          ]);
        }
      }

      expect(sendTransactionInternal).toHaveBeenCalledWith(
        baseClient,
        signerClient,
        publicClient,
        expect.objectContaining({
          to: expectedTo,
          data: expectedData,
          type: 'eip712',
          paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
          paymasterInput: '0xabc',
          value: BigInt(1000),
        }),
        !isDeployed,
      );
      expect(transactionHash).toBe('0xmockedTransactionHash');
    },
  );
});
