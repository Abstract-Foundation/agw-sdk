import {
  createClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, expect, test, vi } from 'vitest';

import { writeContractSync } from '../../../src/actions/writeContractSync.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransactionSync', () => ({
  sendTransactionSync: vi.fn().mockResolvedValue({
    blockHash: '0x1234',
    blockNumber: 1n,
    transactionHash: '0xmockedTransactionHash',
    status: 'success',
  }),
}));

import { sendTransactionSync } from '../../../src/actions/sendTransactionSync.js';

vi.mock('viem/utils', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    getContractError: vi
      .fn()
      .mockReturnValue(new Error('Mocked getContractError')),
  };
});

import { getContractError } from 'viem/utils';

const mockReceipt = {
  blockHash: '0x1234',
  blockNumber: 1n,
  transactionHash: '0xmockedTransactionHash',
  status: 'success',
};

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

const TestTokenABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'qty',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const MOCK_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

beforeEach(() => {
  vi.resetAllMocks();
});

test('basic', async () => {
  vi.mocked(sendTransactionSync).mockResolvedValue(mockReceipt as any);

  const expectedData = encodeFunctionData({
    abi: TestTokenABI,
    args: [address.signerAddress, 1n],
    functionName: 'mint',
  });

  const receipt = await writeContractSync(
    baseClient,
    signerClient,
    publicClient,
    {
      abi: TestTokenABI,
      account: baseClient.account,
      address: MOCK_CONTRACT_ADDRESS,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      functionName: 'mint',
      args: [address.signerAddress, 1n],
    },
  );

  expect(receipt).toBe(mockReceipt);

  expect(sendTransactionSync).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    publicClient,
    {
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      data: expectedData,
      to: MOCK_CONTRACT_ADDRESS,
      throwOnReceiptRevert: undefined,
      timeout: undefined,
    },
    false,
  );
});

test('passes sync-specific params', async () => {
  vi.mocked(sendTransactionSync).mockResolvedValue(mockReceipt as any);

  await writeContractSync(baseClient, signerClient, publicClient, {
    abi: TestTokenABI,
    account: baseClient.account,
    address: MOCK_CONTRACT_ADDRESS,
    chain: anvilAbstractTestnet.chain as ChainEIP712,
    functionName: 'mint',
    args: [address.signerAddress, 1n],
    throwOnReceiptRevert: false,
    timeout: 5000,
  });

  expect(sendTransactionSync).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    publicClient,
    expect.objectContaining({
      throwOnReceiptRevert: false,
      timeout: 5000,
    }),
    false,
  );
});

test('getContractError', async () => {
  vi.mocked(sendTransactionSync).mockRejectedValue(
    new Error('Send transaction failed'),
  );

  await expect(
    writeContractSync(baseClient, signerClient, publicClient, {
      abi: TestTokenABI,
      account: baseClient.account,
      address: MOCK_CONTRACT_ADDRESS,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      functionName: 'mint',
      args: [address.signerAddress, 1n],
    }),
  ).rejects.toThrowError('Mocked getContractError');

  expect(getContractError).toHaveBeenCalledWith(
    new Error('Send transaction failed'),
    {
      abi: TestTokenABI,
      address: MOCK_CONTRACT_ADDRESS,
      args: [address.signerAddress, 1n],
      docsPath: '/docs/contract/writeContract',
      functionName: 'mint',
      sender: baseClient.account.address,
    },
  );
});

test('account not found', async () => {
  const originalAccount = baseClient.account;
  (baseClient as any).account = undefined;

  await expect(
    writeContractSync(baseClient, signerClient, publicClient, {
      abi: TestTokenABI,
      account: baseClient.account,
      address: MOCK_CONTRACT_ADDRESS,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      functionName: 'mint',
      args: [address.signerAddress, 1n],
    }),
  ).rejects.toThrowError(
    'Could not find an Account to execute with this Action',
  );

  expect(sendTransactionSync).not.toHaveBeenCalled();

  (baseClient as any).account = originalAccount;
});
