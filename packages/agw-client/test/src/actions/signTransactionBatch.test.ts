import {
  Address,
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  Hex,
  http,
  parseAbiParameters,
  toFunctionSelector,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, parseEip712Transaction } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { signTransactionBatch } from '../../../src/actions/signTransactionBatch.js';
import { EOA_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendPrivyTransaction');

import { signPrivyTransaction } from '../../../src/actions/sendPrivyTransaction.js';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

baseClient.request = (async ({ method, params }) => {
  if (method === 'eth_chainId') {
    return anvilAbstractTestnet.chain.id;
  } else if (method === 'eth_call') {
    const callParams = params as {
      to: Address;
      data: Hex;
    };
    if (
      callParams.to === address.smartAccountAddress &&
      callParams.data.startsWith(toFunctionSelector('function listHooks(bool)'))
    ) {
      return encodeAbiParameters(parseAbiParameters(['address[]']), [[]]);
    }
    return encodeAbiParameters(parseAbiParameters(['address[]']), [[]]);
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

describe('signTransactionBatch', () => {
  test('signs a batch of EIP-712 transactions correctly', async () => {
    const transactions = [
      {
        to: '0xAbc1230000000000000000000000000000000000',
        value: 1n,
      },
      {
        to: '0xDEF4560000000000000000000000000000000000',
        value: 2n,
        data: '0xabababab',
      },
    ];

    const signedBatch = await signTransactionBatch(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: transactions,
      },
      EOA_VALIDATOR_ADDRESS,
    );

    const parsedBatch = parseEip712Transaction(signedBatch);

    expect(parsedBatch.type).toBe('eip712');
    expect(parsedBatch.to).toBe(baseClient.account.address);
    expect(parsedBatch.data?.slice(0, 10)).toBe(
      toFunctionSelector('function batchCall((address,bool,uint256,bytes)[])'),
    );
    expect(parsedBatch.value).toBe(3n);
  });

  test('prepares calls correctly for privy cross app', async () => {
    vi.mocked(signPrivyTransaction).mockResolvedValue('0x01abab');

    const transactions = [
      {
        to: '0xAbc1230000000000000000000000000000000000',
        value: 1n,
        extraValue: 1n,
      },
      {
        to: '0xDEF4560000000000000000000000000000000000',
        value: 2n,
        data: '0xabababab',
      },
      {
        to: '0x1234567890123456789012345678901234567890',
        data: '0x1234567890123456789012345678901234567890',
      },
    ];

    const signedBatch = await signTransactionBatch(
      baseClient,
      signerClient,
      publicClient,
      {
        calls: transactions,
      },
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
      true,
    );

    expect(signedBatch).toBe('0x01abab');

    expect(signPrivyTransaction).toHaveBeenCalledWith(baseClient, {
      calls: transactions.map((transaction) => ({
        to: transaction.to,
        data: transaction.data,
        value: transaction.value,
      })),
    });
  });
});
