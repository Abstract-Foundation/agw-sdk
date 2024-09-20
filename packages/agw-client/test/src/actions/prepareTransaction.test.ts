import {
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  http,
  toHex,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { expect, test, vi } from 'vitest';

import { prepareTransactionRequest } from '../../../src/actions/prepareTransaction.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const MOCK_GAS_LIMIT = 158774n;
const MOCK_FEE_PER_GAS = 250000001n;
const MOCK_NONCE = 34;

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
    return MOCK_GAS_LIMIT;
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
      max_fee_per_gas: toHex(MOCK_FEE_PER_GAS),
      max_priority_fee_per_gas: '0x0',
    };
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

publicClient.getTransactionCount = vi.fn(async () => {
  return MOCK_NONCE;
});

const transaction: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

test('basic', async () => {
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      chain: anvilAbstractTestnet.chain,
    },
    false,
  );
  expect(request).toEqual({
    ...transaction,
    chain: anvilAbstractTestnet.chain,
    from: address.smartAccountAddress,
    chainId: anvilAbstractTestnet.chain.id,
    gas: MOCK_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });
});
