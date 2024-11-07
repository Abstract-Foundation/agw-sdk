import {
  createClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  http,
  parseAbiParameters,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';
import {
  ChainEIP712,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  ZksyncTransactionRequestEIP712,
} from 'viem/zksync';
import { expect, test } from 'vitest';

import { signTransaction } from '../../../src/actions/signTransaction.js';
import { VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

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

const transaction: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

const transactionWithBigIntValues = {
  value: 1n,
  nonce: 2n,
  maxPriorityFeePerGas: 3n,
  gas: 4n,
  gasPerPubdata: 5n,
};

const transactionWithHexValues = {
  value: '0x1',
  nonce: '0x2',
  maxPriorityFeePerGas: '0x3',
  gas: '0x4',
  gasPerPubdata: '0x5',
};

test('with useSignerAddress false', async () => {
  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address', 'bytes[]']),
    [RAW_SIGNATURE, VALIDATOR_ADDRESS, []],
  );

  const expectedSignedTransaction =
    anvilAbstractTestnet.chain.serializers?.transaction(
      {
        chainId: anvilAbstractTestnet.chain.id,
        ...transaction,
        from: address.smartAccountAddress,
        customSignature: signature,
        type: 'eip712' as any,
      },
      { r: '0x0', s: '0x0', v: 0n },
    ) as SignEip712TransactionReturnType;

  const signedTransaction = await signTransaction(
    baseClient,
    signerClient,
    {
      ...transaction,
      type: 'eip712',
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
    } as SignEip712TransactionParameters,
    false,
  );
  expect(signedTransaction).toBe(expectedSignedTransaction);
});

test('with useSignerAddress true', async () => {
  const signature = RAW_SIGNATURE;

  const expectedSignedTransaction =
    anvilAbstractTestnet.chain.serializers?.transaction(
      {
        chainId: anvilAbstractTestnet.chain.id,
        ...transaction,
        from: address.signerAddress,
        customSignature: signature,
        type: 'eip712' as any,
      },
      { r: '0x0', s: '0x0', v: 0n },
    ) as SignEip712TransactionReturnType;

  const signedTransaction = await signTransaction(
    baseClient,
    signerClient,
    {
      ...transaction,
      type: 'eip712',
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
    } as SignEip712TransactionParameters,
    true,
  );
  expect(signedTransaction).toBe(expectedSignedTransaction);
});

test('handles hex values', async () => {
  const signedTransactionWithHexValues = await signTransaction(
    baseClient,
    signerClient,
    {
      ...transactionWithHexValues,
      type: 'eip712',
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
    } as any,
    false,
  );

  const signedTransactionWithBigIntValues = await signTransaction(
    baseClient,
    signerClient,
    {
      ...transactionWithBigIntValues,
      type: 'eip712',
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
    } as any,
    false,
  );

  expect(signedTransactionWithHexValues).toBe(
    signedTransactionWithBigIntValues,
  );
});

test('invalid chain', async () => {
  const invalidChain = mainnet;
  expect(
    async () =>
      await signTransaction(
        baseClient,
        signerClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: invalidChain,
        } as SignEip712TransactionParameters,
        true,
      ),
  ).rejects.toThrowError('Invalid chain specified');
});

test('no account provided', async () => {
  baseClient.account = undefined as any;
  expect(
    async () =>
      await signTransaction(
        baseClient,
        signerClient,
        {
          ...transaction,
          type: 'eip712',
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        } as any,
        false,
      ),
  ).rejects.toThrowError(
    'Could not find an Account to execute with this Action.',
  );
});
