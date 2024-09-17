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
import { expect, test } from 'vitest';

import { sendTransaction } from '../../../src/actions/sendTransaction.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

const MOCK_TRANSACTION_HASH =
  '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

baseClient.request = (async ({ method, params }) => {
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
}) as EIP1193RequestFn;

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

test('without initial code', async () => {
  const transactionHash = await sendTransaction(
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
  );
  expect(transactionHash).toBe(MOCK_TRANSACTION_HASH);
});
