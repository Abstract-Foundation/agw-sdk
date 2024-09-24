import {
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { abstractTestnet, mainnet } from 'viem/chains';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { sendTransactionInternal } from '../../../../src/actions/sendTransactionInternal.js';
import { anvilAbstractTestnet } from '../../../anvil.js';
import { address } from '../../../constants.js';

// Mock the signTransaction function
vi.mock('../../../../src/actions/signTransaction', () => ({
  signTransaction: vi.fn().mockResolvedValue('0xmockedSerializedTransaction'),
}));

import { signTransaction } from '../../../../src/actions/signTransaction.js';

const MOCK_TRANSACTION_HASH =
  '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const baseClientRequestSpy = vi.fn(async ({ method, params }) => {
  if (method === 'eth_chainId') {
    return anvilAbstractTestnet.chain.id;
  }
  if (method === 'eth_estimateGas') {
    return 158774n;
  }
  if (method === 'eth_sendRawTransaction') {
    return MOCK_TRANSACTION_HASH;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
});

baseClient.request = baseClientRequestSpy as unknown as EIP1193RequestFn;

const signerClient = createWalletClient({
  account: toAccount(address.signerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

signerClient.request = (async ({ method, params }) => {
  if (method === 'eth_signTypedData_v4') {
    return RAW_SIGNATURE;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

publicClient.request = (async ({ method, params }) => {
  if (method === 'zks_estimateFee') {
    return {
      gas_limit: '0x156c00',
      gas_per_pubdata_limit: '0x143b',
      max_fee_per_gas: '0xee6b280',
      max_priority_fee_per_gas: '0x0',
    };
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

const transaction: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

describe('sendTransactionInternal', () => {
  const testCases = [
    {
      name: 'is initial transaction',
      isInitialTransaction: true,
      expectedFromAddress: address.signerAddress,
    },
    {
      name: 'is not initial transaction',
      isInitialTransaction: false,
      expectedFromAddress: address.smartAccountAddress,
    },
  ];

  test.each(testCases)(
    '$name',
    async ({ isInitialTransaction, expectedFromAddress }) => {
      const transactionHash = await sendTransactionInternal(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        } as any,
        isInitialTransaction,
      );

      expect(transactionHash).toBe(MOCK_TRANSACTION_HASH);

      // Validate that signTransaction was called with the correct parameters
      expect(signTransaction).toHaveBeenCalledWith(
        baseClient,
        signerClient,
        expect.objectContaining({
          type: 'eip712',
          to: '0x5432100000000000000000000000000000000000',
          from: expectedFromAddress,
          data: '0x1234',
          paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
          paymasterInput: '0x',
          chainId: abstractTestnet.id,
        }),
        isInitialTransaction,
      );

      // Validate that the sendRawTransaction call was made with the correct parameters
      const sendRawTransactionCall = baseClientRequestSpy.mock.calls.find(
        (call) => call[0].method === 'eth_sendRawTransaction',
      );
      expect(sendRawTransactionCall).toBeDefined();
      if (sendRawTransactionCall) {
        const [rawTransaction] = sendRawTransactionCall[0].params;
        expect(rawTransaction).toEqual('0xmockedSerializedTransaction');
      }
    },
  );
});

test('sendTransactionInternal with mismatched chain', async () => {
  const invalidChain = mainnet;
  expect(
    async () =>
      await sendTransactionInternal(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: invalidChain,
        } as any,
        false,
      ),
  ).rejects.toThrowError('Current Chain ID:  11124');
});
