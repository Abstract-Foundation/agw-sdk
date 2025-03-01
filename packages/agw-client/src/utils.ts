import { 
  type Address,
  BaseError,
  type Chain,
  encodeFunctionData,
  fromHex,
  type Hex,
  isHex,
  keccak256,
  type PublicClient,
  toBytes,
  toHex,
  type Transport,
  type TypedDataDefinition,
  type UnionRequiredBy,
} from 'viem';
import { parseAccount } from 'viem/accounts';
import { abstract, abstractTestnet } from 'viem/chains';
import {
  type ChainEIP712,
  type SignEip712TransactionParameters,
} from 'viem/zksync';

import AccountFactoryAbi from './abis/AccountFactory.js';
import { AGWRegistryAbi } from './abis/AGWRegistryAbi.js';
import {
  AGW_REGISTRY_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from './constants.js';
import { isEIP712Transaction } from './eip712.js';
import { type Call } from './types/call.js';

// Constants
const VALID_CHAINS: Record<number, Chain> = {
  [abstractTestnet.id]: abstractTestnet,
  [abstract.id]: abstract,
};

const INITIALIZER_ABI = [{
  name: 'initialize',
  type: 'function',
  inputs: [
    { name: 'initialK1Owner', type: 'address' },
    { name: 'initialK1Validator', type: 'address' },
    { name: 'modules', type: 'bytes[]' },
    {
      name: 'initCall',
      type: 'tuple',
      components: [
        { name: 'target', type: 'address' },
        { name: 'allowFailure', type: 'bool' },
        { name: 'value', type: 'uint256' },
        { name: 'callData', type: 'bytes' },
      ],
    },
  ],
  outputs: [],
  stateMutability: 'nonpayable',
}] as const;

// Type guards
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

// Utility functions
export function convertBigIntToString<T>(value: T): T {
  if (typeof value === 'bigint') {
    return value.toString() as T;
  }
  
  if (Array.isArray(value)) {
    return value.map(convertBigIntToString) as T;
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, convertBigIntToString(v)]
    ) as T;
  }

  return value;
}

export async function getSmartAccountAddressFromInitialSigner<C extends ChainEIP712 | undefined>(
  initialSigner: Address,
  publicClient: PublicClient<Transport, C>,
): Promise<Hex> {
  const salt = keccak256(toBytes(initialSigner));
  return publicClient.readContract({
    address: SMART_ACCOUNT_FACTORY_ADDRESS,
    abi: AccountFactoryAbi,
    functionName: 'getAddressForSalt',
    args: [salt],
  }) as Promise<Hex>;
}

export async function isAGWAccount<C extends ChainEIP712 | undefined>(
  publicClient: PublicClient<Transport, C>,
  address: Address,
): Promise<boolean> {
  return publicClient.readContract({
    address: AGW_REGISTRY_ADDRESS,
    abi: AGWRegistryAbi,
    functionName: 'isAGW',
    args: [address],
  });
}

export async function isSmartAccountDeployed<C extends ChainEIP712 | undefined>(
  publicClient: PublicClient<Transport, C>,
  address: Hex,
): Promise<boolean> {
  const bytecode = await publicClient.getBytecode({ address });
  return bytecode !== undefined;
}

export function getInitializerCalldata(
  initialOwnerAddress: Address,
  validatorAddress: Address,
  initialCall: Call,
): Hex {
  return encodeFunctionData({
    abi: INITIALIZER_ABI,
    functionName: 'initialize',
    args: [initialOwnerAddress, validatorAddress, [], initialCall],
  });
}

export function transformHexValues(transaction: unknown, keys: string[]): void {
  if (!isObject(transaction)) return;

  for (const key of keys) {
    const value = transaction[key];
    if (isHex(value)) {
      transaction[key] = fromHex(value, 'bigint');
    }
  }
}

export function isEip712TypedData(typedData: TypedDataDefinition): boolean {
  return (
    isObject(typedData.message) &&
    isObject(typedData.domain) &&
    typedData.domain.name === 'zkSync' &&
    typedData.domain.version === '2' &&
    isEIP712Transaction(typedData.message)
  );
}

export function transformEip712TypedData(
  typedData: TypedDataDefinition,
): UnionRequiredBy<Omit<SignEip712TransactionParameters, 'chain'>, 'to' | 'data'> & { chainId: number } {
  if (!isEip712TypedData(typedData)) {
    throw new BaseError('Invalid EIP712 transaction format');
  }

  const { domain, message } = typedData;
  if (domain.chainId === undefined) {
    throw new BaseError('Missing chain ID in EIP712 transaction');
  }

  const toHex20 = (value: string) => toHex(BigInt(value), { size: 20 });

  return {
    chainId: Number(domain.chainId),
    account: parseAccount(toHex20(message.from as string)),
    to: toHex20(message.to as string),
    gas: BigInt(message.gasLimit as string),
    gasPerPubdata: BigInt(message.gasPerPubdataByteLimit as string),
    maxFeePerGas: BigInt(message.maxFeePerGas as string),
    maxPriorityFeePerGas: BigInt(message.maxPriorityFeePerGas as string),
    paymaster: message.paymaster !== '0' ? toHex20(message.paymaster as string) : undefined,
    nonce: message.nonce as number,
    value: BigInt(message.value as string),
    data: message.data === '0x0' ? '0x' : message.data as Hex,
    factoryDeps: message.factoryDeps as Hex[],
    paymasterInput: message.paymasterInput !== '0x' ? message.paymasterInput as Hex : undefined,
  };
}
