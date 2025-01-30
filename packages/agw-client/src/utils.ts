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

export const VALID_CHAINS: Record<number, Chain> = {
  [abstractTestnet.id]: abstractTestnet,
  [abstract.id]: abstract,
};

export function convertBigIntToString(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  } else if (Array.isArray(value)) {
    return value.map(convertBigIntToString);
  } else if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        convertBigIntToString(val),
      ]),
    );
  }
  return value;
}

export async function getSmartAccountAddressFromInitialSigner<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  initialSigner: Address,
  publicClient: PublicClient<Transport, chain>,
): Promise<Hex> {
  if (initialSigner === undefined) {
    throw new Error('Initial signer is required to get smart account address');
  }
  // Generate salt based off address
  const addressBytes = toBytes(initialSigner);
  const salt = keccak256(addressBytes);

  // Get the deployed account address
  const accountAddress = (await publicClient.readContract({
    address: SMART_ACCOUNT_FACTORY_ADDRESS,
    abi: AccountFactoryAbi,
    functionName: 'getAddressForSalt',
    args: [salt],
  })) as Hex;

  return accountAddress;
}

export async function isAGWAccount<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  publicClient: PublicClient<Transport, chain>,
  address: Address,
): Promise<boolean> {
  return await publicClient.readContract({
    address: AGW_REGISTRY_ADDRESS,
    abi: AGWRegistryAbi,
    functionName: 'isAGW',
    args: [address],
  });
}

export async function isSmartAccountDeployed<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  publicClient: PublicClient<Transport, chain>,
  address: Hex,
): Promise<boolean> {
  const bytecode = await publicClient.getCode({
    address: address,
  });
  return bytecode !== undefined;
}

export function getInitializerCalldata(
  initialOwnerAddress: Address,
  validatorAddress: Address,
  initialCall: Call,
): Hex {
  return encodeFunctionData({
    abi: [
      {
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
      },
    ],
    functionName: 'initialize',
    args: [initialOwnerAddress, validatorAddress, [], initialCall],
  });
}

export function transformHexValues(transaction: any, keys: string[]) {
  if (!transaction) return;
  for (const key of keys) {
    if (isHex(transaction[key])) {
      transaction[key] = fromHex(transaction[key], 'bigint');
    }
  }
}

export function isEip712TypedData(typedData: TypedDataDefinition): boolean {
  return (
    typedData.message &&
    typedData.domain?.name === 'zkSync' &&
    typedData.domain?.version === '2' &&
    isEIP712Transaction(typedData.message)
  );
}

export function transformEip712TypedData(
  typedData: TypedDataDefinition,
): UnionRequiredBy<
  Omit<SignEip712TransactionParameters, 'chain'>,
  'to' | 'data'
> & { chainId: number } {
  if (!isEip712TypedData(typedData)) {
    throw new BaseError('Typed data is not an EIP712 transaction');
  }

  if (typedData.domain?.chainId === undefined) {
    throw new BaseError('Chain ID is required for EIP712 transaction');
  }

  return {
    chainId: Number(typedData.domain.chainId),
    account: parseAccount(
      toHex(BigInt(typedData.message['from'] as string), {
        size: 20,
      }),
    ),
    to: toHex(BigInt(typedData.message['to'] as string), {
      size: 20,
    }),
    gas: BigInt(typedData.message['gasLimit'] as string),
    gasPerPubdata: BigInt(
      typedData.message['gasPerPubdataByteLimit'] as string,
    ),
    maxFeePerGas: BigInt(typedData.message['maxFeePerGas'] as string),
    maxPriorityFeePerGas: BigInt(
      typedData.message['maxPriorityFeePerGas'] as string,
    ),
    paymaster:
      (typedData.message['paymaster'] as string) != '0'
        ? toHex(BigInt(typedData.message['paymaster'] as string), {
            size: 20,
          })
        : undefined,
    nonce: typedData.message['nonce'] as number,
    value: BigInt(typedData.message['value'] as string),
    data:
      typedData.message['data'] === '0x0'
        ? '0x'
        : (typedData.message['data'] as Hex),
    factoryDeps: typedData.message['factoryDeps'] as Hex[],
    paymasterInput:
      typedData.message['paymasterInput'] !== '0x'
        ? (typedData.message['paymasterInput'] as Hex)
        : undefined,
  };
}
