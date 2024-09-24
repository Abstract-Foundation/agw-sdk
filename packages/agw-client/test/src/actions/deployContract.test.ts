import {
  createClient,
  createPublicClient,
  createWalletClient,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, encodeDeployData } from 'viem/zksync';
import { expect, test, vi } from 'vitest';

import { deployContract } from '../../../src/actions/deployContract.js';
import { CONTRACT_DEPLOYER_ADDRESS } from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/actions/sendTransaction', () => ({
  sendTransaction: vi.fn().mockResolvedValue('0xmockedTransactionHash'),
}));

import { sendTransaction } from '../../../src/actions/sendTransaction.js';

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
        internalType: 'uint256',
        name: 'newVal',
        type: 'uint256',
      },
    ],
    name: 'setValue',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const MOCK_SALT =
  '0x7f1e3b5a9c2d8f4e6a0c2d4f6a8b0c2d4e6f8a0b2c4d6e8f0a2c4e6f8a0b2c4d';

const contractBytecode =
  '0x0000000100200190000000150000c13d000000000201001900000060022002700000000902200197000000040020008c0000001f0000413d000000000301043b0000000b033001970000000c0030009c0000001f0000c13d000000240020008c0000001f0000413d0000000002000416000000000002004b0000001f0000c13d0000000401100370000000000101043b000000000010041b0000000001000019000000220001042e0000008001000039000000400010043f0000000001000416000000000001004b0000001f0000c13d0000002001000039000001000010044300000120000004430000000a01000041000000220001042e000000000100001900000023000104300000002100000432000000220001042e000000230001043000000000000000000000000000000000000000000000000000000000ffffffff0000000200000000000000000000000000000040000001000000000000000000ffffffff0000000000000000000000000000000000000000000000000000000055241077000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000bb15b285040315edf518d7c864e5d2c87378a8f1c65f45218de9cd10f3f559ed';

test('create2 with factoryDeps', async () => {
  vi.mocked(sendTransaction).mockResolvedValue('0xmockedTransactionHash');

  const expectedData = encodeDeployData({
    abi: TestTokenABI,
    args: [],
    bytecode: contractBytecode,
    deploymentType: 'create2',
    salt: MOCK_SALT,
  });

  const transactionHash = await deployContract(
    baseClient,
    signerClient,
    publicClient,
    {
      abi: TestTokenABI,
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      bytecode: contractBytecode,
      args: [],
      deploymentType: 'create2',
      salt: MOCK_SALT,
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
      factoryDeps: [contractBytecode],
      to: CONTRACT_DEPLOYER_ADDRESS,
    },
  );
});

test('create2 with no chain and no account', async () => {
  vi.mocked(sendTransaction).mockResolvedValue('0xmockedTransactionHash');

  const expectedData = encodeDeployData({
    abi: TestTokenABI,
    args: [],
    bytecode: contractBytecode,
    deploymentType: 'create2',
    salt: MOCK_SALT,
  });

  const transactionHash = await deployContract(
    baseClient,
    signerClient,
    publicClient,
    {
      abi: TestTokenABI,
      bytecode: contractBytecode,
      args: [],
      deploymentType: 'create2',
      salt: MOCK_SALT,
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
      factoryDeps: [contractBytecode],
      to: CONTRACT_DEPLOYER_ADDRESS,
    },
  );
});
