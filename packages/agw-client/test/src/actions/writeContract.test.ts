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

import { writeContract } from '../../../src/actions/writeContract.js';
import { anvilAbstractTestnet } from '../anvil.js';
import { address } from '../constants.js';

vi.mock('../../../src/actions/sendTransaction', () => ({
  sendTransaction: vi.fn().mockResolvedValue('0xmockedTransactionHash'),
}));

import { sendTransaction } from '../../../src/actions/sendTransaction.js';

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
  vi.mocked(sendTransaction).mockResolvedValue('0xmockedTransactionHash');

  const expectedData = encodeFunctionData({
    abi: TestTokenABI,
    args: [address.signerAddress, 1n],
    functionName: 'mint',
  });

  const transactionHash = await writeContract(
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

  expect(transactionHash).toBe('0xmockedTransactionHash');

  expect(sendTransaction).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    publicClient,
    {
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      data: expectedData,
      to: MOCK_CONTRACT_ADDRESS,
    },
  );
});

test('getContractError', async () => {
  vi.mocked(sendTransaction).mockRejectedValue(
    new Error('Send transaction failed'),
  );

  const expectedData = encodeFunctionData({
    abi: TestTokenABI,
    args: [address.signerAddress, 1n],
    functionName: 'mint',
  });

  await expect(
    writeContract(baseClient, signerClient, publicClient, {
      abi: TestTokenABI,
      account: baseClient.account,
      address: MOCK_CONTRACT_ADDRESS,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      functionName: 'mint',
      args: [address.signerAddress, 1n],
    }),
  ).rejects.toThrowError('Mocked getContractError');

  expect(sendTransaction).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    publicClient,
    {
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      data: expectedData,
      to: MOCK_CONTRACT_ADDRESS,
    },
  );

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
    writeContract(baseClient, signerClient, publicClient, {
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

  expect(sendTransaction).not.toHaveBeenCalled();

  // Restore the original account after the test
  (baseClient as any).account = originalAccount;
});
