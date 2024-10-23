import {
  Address,
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  Hex,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { parseAccount } from 'viem/utils';
import { ChainEIP712 } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { sendPrivyTransaction } from '../../../../src/actions/sendPrivyTransaction.js';
import { anvilAbstractTestnet } from '../../../anvil.js';
import { address } from '../../../constants.js';

const MOCK_TRANSACTION_HASH =
  '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87';

const baseClientRequestSpy = vi.fn(async ({ method, params }) => {
  if (method === 'privy_sendSmartWalletTx') {
    return MOCK_TRANSACTION_HASH;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
});

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

baseClient.request = baseClientRequestSpy as unknown as EIP1193RequestFn;

const signerClient = createWalletClient({
  account: toAccount(address.signerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const transaction = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
  value: 10000,
};

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

describe('sendPrivyTransaction', () => {
  test('sends a transaction correctly', async () => {
    const transactionHash = await sendPrivyTransaction(
      baseClient,
      signerClient,
      {
        ...transaction,
        type: 'eip712',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      } as any,
      false,
    );

    expect(transactionHash).toBe(MOCK_TRANSACTION_HASH);

    expect(baseClientRequestSpy).toHaveBeenCalledWith(
      {
        method: 'privy_sendSmartWalletTx',
        params: [
          parseAccount(baseClient.account),
          {
            ...transaction,
            value: BigInt(transaction.value),
            type: 'eip712',
          },
          [
            {
              to: transaction.to,
              value: BigInt(transaction.value),
              data: transaction.data,
            },
          ],
        ],
      },
      { retryCount: 0 },
    );
  });
});
