import {
  createClient,
  createNonceManager,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeFunctionData,
  http,
  keccak256,
  NonceManager,
  nonceManager,
  parseEther,
  toBytes,
  toHex,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { expect, test, vi } from 'vitest';

import {
  MaxFeePerGasTooLowError,
  prepareTransactionRequest,
} from '../../../src/actions/prepareTransaction.js';
import {
  CONTRACT_DEPLOYER_ADDRESS,
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../../../src/constants.js';
import { InsufficientBalanceError } from '../../../src/errors/insufficientBalance.js';
import { AccountFactoryAbi } from '../../../src/exports/constants.js';
import {
  getInitializerCalldata,
  isSmartAccountDeployed,
} from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/utils.js');
vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    encodeFunctionData: vi.fn().mockReturnValue('0xmockedEncodedData'),
    getBalance: vi.fn().mockResolvedValue(1000000000000000000n), // 1 ETH
  };
});

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
const MOCK_ETH_ESTIMATE_GAS_LIMIT = 158774n;
const MOCK_ZKS_ESTIMATE_GAS_LIMIT = 1403904n;
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
    return MOCK_ETH_ESTIMATE_GAS_LIMIT;
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
      gas_limit: toHex(MOCK_ZKS_ESTIMATE_GAS_LIMIT),
      gas_per_pubdata_limit: '0x143b',
      max_fee_per_gas: toHex(MOCK_FEE_PER_GAS),
      max_priority_fee_per_gas: '0x0',
    };
  } else if (method === 'eth_getBalance') {
    return toHex(1000000000000000000n); // 1 ETH
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
  value: 1000n,
  data: '0xTransactionData',
};

test('minimum, not initial transaction', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: false,
    },
  );
  expect(request).toEqual({
    ...transaction,
    chain: anvilAbstractTestnet.chain,
    from: address.smartAccountAddress,
    gas: MOCK_ZKS_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });
});

test('is initial transaction', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(false);
  vi.mocked(getInitializerCalldata).mockReturnValue(
    '0xmockedInitializerCallData',
  );
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: true,
    },
  );
  expect(request).toEqual({
    ...transaction,
    from: address.signerAddress,
    to: SMART_ACCOUNT_FACTORY_ADDRESS,
    data: '0xmockedEncodedData',
    chain: anvilAbstractTestnet.chain,
    gas: MOCK_ZKS_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });

  expect(getInitializerCalldata).toHaveBeenCalledWith(
    address.signerAddress,
    EOA_VALIDATOR_ADDRESS,
    {
      target: transaction.to,
      allowFailure: false,
      value: transaction.value,
      callData: transaction.data,
    },
  );

  const salt = keccak256(toBytes(address.signerAddress));
  expect(encodeFunctionData).toHaveBeenCalledWith({
    abi: AccountFactoryAbi,
    functionName: 'deployAccount',
    args: [salt, '0xmockedInitializerCallData'],
  });
});

test('with fees', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      maxFeePerGas: 10000n,
      maxPriorityFeePerGas: 0n,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: false,
    },
  );
  expect(request).toEqual({
    ...transaction,
    chain: anvilAbstractTestnet.chain,
    from: address.smartAccountAddress,
    gas: MOCK_ETH_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: 10000n,
    maxPriorityFeePerGas: 0n,
  });
});

test('to contract deployer', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      to: CONTRACT_DEPLOYER_ADDRESS,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: false,
    },
  );
  expect(request).toEqual({
    ...transaction,
    to: CONTRACT_DEPLOYER_ADDRESS,
    chain: anvilAbstractTestnet.chain,
    from: address.smartAccountAddress,
    gas: MOCK_ETH_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: 25000000n, // Default fee for contract deployments
    maxPriorityFeePerGas: 0n,
  });
});

test('with chainId but not chain', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      chainId: anvilAbstractTestnet.chain.id,
      ...transaction,
    } as any,
  );
  expect(request).toEqual({
    ...transaction,
    from: address.smartAccountAddress,
    chainId: anvilAbstractTestnet.chain.id,
    gas: MOCK_ZKS_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });
});

test('with no chainId or chain', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    transaction as any,
  );
  expect(request).toEqual({
    ...transaction,
    from: address.smartAccountAddress,
    gas: MOCK_ZKS_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });
});

test('with nonce manager', async () => {
  const mockConsume = vi.fn().mockResolvedValue(MOCK_NONCE);
  const fakeNonceManager: NonceManager = {
    consume: mockConsume,
    increment: vi.fn(),
    get: vi.fn(),
    reset: vi.fn(),
  };

  const request = await prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClient,
    {
      ...transaction,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: false,
      nonceManager: fakeNonceManager,
    },
  );

  expect(request).toEqual({
    ...transaction,
    chain: anvilAbstractTestnet.chain,
    from: address.smartAccountAddress,
    gas: MOCK_ZKS_ESTIMATE_GAS_LIMIT,
    nonce: MOCK_NONCE,
    maxFeePerGas: MOCK_FEE_PER_GAS,
    maxPriorityFeePerGas: 0n,
  });

  expect(mockConsume).toHaveBeenCalledWith({
    address: address.smartAccountAddress,
    chainId: anvilAbstractTestnet.chain.id,
    client: publicClient,
  });
});

test('throws if maxFeePerGas is too low', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  const publicClientModified = createPublicClient({
    chain: anvilAbstractTestnet.chain as ChainEIP712,
    transport: anvilAbstractTestnet.clientConfig.transport,
  });

  publicClientModified.request = (async ({ method, params }) => {
    if (method === 'zks_estimateFee') {
      return {
        gas_limit: '0x156c00',
        gas_per_pubdata_limit: '0x143b',
        max_fee_per_gas: toHex(MOCK_FEE_PER_GAS),
        max_priority_fee_per_gas: '0xffffff', // this shouldn't happen in production
      };
    }
    return anvilAbstractTestnet.getClient().request({ method, params } as any);
  }) as EIP1193RequestFn;

  await expect(
    prepareTransactionRequest(baseClient, signerClient, publicClientModified, {
      ...transaction,
      chain: anvilAbstractTestnet.chain,
      maxFeePerGas: 10000n,
    }),
  ).rejects.toThrow(MaxFeePerGasTooLowError);
});

test.each([
  {
    name: 'throws if insufficient balance with value',
    balance: parseEther('0.09'),
    value: parseEther('0.1'),
    isSponsored: false,
    errorType: InsufficientBalanceError,
  },
  {
    name: 'does not throw if balance is sufficient with value',
    balance: parseEther('0.09'),
    value: parseEther('0.001'),
    isSponsored: false,
    expectToThrow: false,
  },
  {
    name: 'does not throw if balance is sufficient with no value',
    balance: parseEther('0.09'),
    value: undefined,
    isSponsored: false,
    expectToThrow: false,
  },
  {
    name: 'throws if balance is insufficient with no value',
    balance: 25000000100000n - 1n, // 1 wei short
    value: undefined,
    isSponsored: false,
    errorType: InsufficientBalanceError,
  },
  {
    name: 'does not throw if insufficient balance if the transaction is sponsored but lacks gas',
    balance: parseEther('0.1'),
    value: parseEther('0.1'),
    isSponsored: true,
  },
  {
    name: 'throws if the transaction is sponsored but lacks enough value',
    balance: parseEther('0.09'),
    value: parseEther('0.1'),
    isSponsored: true,
    errorType: InsufficientBalanceError,
  },
])('$name', async ({ balance, value, isSponsored, errorType }) => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);

  // Create a modified public client that returns a specified balance
  const publicClientWithCustomBalance = createPublicClient({
    chain: anvilAbstractTestnet.chain as ChainEIP712,
    transport: anvilAbstractTestnet.clientConfig.transport,
  });

  publicClientWithCustomBalance.request = (async ({ method, params }) => {
    if (method === 'zks_estimateFee') {
      return {
        gas_limit: 100_000n,
        gas_per_pubdata_limit: '0x143b',
        max_fee_per_gas: toHex(MOCK_FEE_PER_GAS),
        max_priority_fee_per_gas: '0x0',
      };
    } else if (method === 'eth_getBalance') {
      return balance;
    }
    return anvilAbstractTestnet.getClient().request({ method, params } as any);
  }) as EIP1193RequestFn;

  const txWithoutPaymaster = {
    ...transaction,
    ...(value !== undefined && { value }),
    paymaster: undefined,
    paymasterInput: undefined,
  };

  const paymasterArgs = isSponsored
    ? {
        paymaster: transaction.paymaster,
        paymasterInput: transaction.paymasterInput,
      }
    : {};

  const txRequest = prepareTransactionRequest(
    baseClient,
    signerClient,
    publicClientWithCustomBalance,
    {
      ...txWithoutPaymaster,
      ...paymasterArgs,
      chain: anvilAbstractTestnet.chain,
      isInitialTransaction: false,
    },
  );

  if (errorType) {
    await expect(txRequest).rejects.toThrow(errorType);
  } else {
    await expect(txRequest).resolves.not.toThrow();
  }
});
function jsonRpc(): import('viem').NonceManagerSource {
  throw new Error('Function not implemented.');
}
