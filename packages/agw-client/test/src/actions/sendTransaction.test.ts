import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  zeroAddress,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { sendTransaction } from '../../../src/actions/sendTransaction.js';
import { EOA_VALIDATOR_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransactionInternal');
vi.mock('../../../src/actions/sendPrivyTransaction');

import { signPrivyTransaction } from '../../../src/actions/sendPrivyTransaction.js';
import { sendTransactionInternal } from '../../../src/actions/sendTransactionInternal.js';

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

const transaction: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0xabc',
};

describe('sendTransaction', () => {
  test('sendTransaction calls sendTransactionInternal correctly', async () => {
    vi.mocked(sendTransactionInternal).mockResolvedValue(
      '0xmockedTransactionHash',
    );
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
      false,
    );

    expect(sendTransactionInternal).toHaveBeenCalledWith(
      baseClient,
      signerClient,
      publicClient,
      expect.objectContaining({
        from: zeroAddress,
        to: transaction.to,
        data: transaction.data,
        type: 'eip712',
        paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
        paymasterInput: '0xabc',
        account: baseClient.account,
        chain: anvilAbstractTestnet.chain as ChainEIP712,
      }),
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
    );
    expect(transactionHash).toBe('0xmockedTransactionHash');
  });

  test('sendTransaction calls sendPrivyTransaction correctly', async () => {
    vi.mocked(signPrivyTransaction).mockResolvedValue('0x01abab');
    vi.spyOn(publicClient, 'sendRawTransaction').mockResolvedValue('0x01234');

    const transactionHash = await sendTransaction(
      baseClient,
      signerClient,
      publicClient,
      {
        ...transaction,
        type: 'eip712',
      } as any,
      true,
    );

    expect(signPrivyTransaction).toHaveBeenCalledWith(
      baseClient,
      expect.objectContaining(transaction),
    );
    expect(publicClient.sendRawTransaction).toHaveBeenCalledWith({
      serializedTransaction: '0x01abab',
    });
    expect(transactionHash).toBe('0x01234');
  });
});
