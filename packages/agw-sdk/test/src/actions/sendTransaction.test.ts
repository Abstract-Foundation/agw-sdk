import {
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  http,
  parseAbiParameters,
  type SendTransactionRequest,
} from 'viem';
import { toAccount } from 'viem/accounts';
import {
  ChainEIP712,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  ZksyncTransactionRequestEIP712,
} from 'viem/zksync';
import { expect, test, vi } from 'vitest';

import {
  _sendTransaction,
  sendTransaction,
} from '../../../src/actions/sendTransaction.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

// Mock the signTransaction function
vi.mock('../../../src/actions/signTransaction', () => ({
  signTransaction: vi.fn().mockResolvedValue('0xmockedSerializedTransaction'),
}));

import { abstractTestnet } from 'viem/chains';

import { signTransaction } from '../../../src/actions/signTransaction.js';

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
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

test('_sendTransaction without initial code', async () => {
  const transactionHash = await _sendTransaction(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      type: 'eip712',
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
    } as any,
    address.validatorAddress,
    true,
  );
  expect(transactionHash).toBe(MOCK_TRANSACTION_HASH);

  // Validate that signTransaction was called with the correct parameters
  expect(signTransaction).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    expect.objectContaining({
      type: 'eip712',
      to: '0x5432100000000000000000000000000000000000',
      from: address.signerAddress,
      paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
      paymasterInput: '0x',
      chainId: abstractTestnet.id,
    }),
    address.validatorAddress,
    true,
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
});
