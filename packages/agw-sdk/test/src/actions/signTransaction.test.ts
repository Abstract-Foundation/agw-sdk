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
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

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

test('with useSignerAddress false', async () => {
  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address', 'bytes[]']),
    [RAW_SIGNATURE, address.validatorAddress, []],
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
    address.validatorAddress,
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
    address.validatorAddress,
    true,
  );
  expect(signedTransaction).toBe(expectedSignedTransaction);
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
        address.validatorAddress,
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
        address.validatorAddress,
        false,
      ),
  ).rejects.toThrowError(
    'Could not find an Account to execute with this Action.',
  );
});
