import {
  type Address,
  encodeFunctionData,
  type Hex,
  keccak256,
  type PublicClient,
  toBytes,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
  type TypedDataParameter,
} from 'viem';
import { type ChainEIP712 } from 'viem/zksync';

import AccountFactoryAbi from './abis/AccountFactory.js';
import { SMART_ACCOUNT_FACTORY_ADDRESS } from './constants.js';
import { type Call } from './types/call.js';

type MessageTypes = Record<string, { name: string; type: string }[]>;

function convertBigIntToString(value: any): any {
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

interface MessageTypeProperty {
  name: string;
  type: string;
}

export function convertToSignTypedDataParams<
  T extends TypedData | Record<string, unknown>,
  P extends keyof T | 'EIP712Domain',
>(typedDataDef: TypedDataDefinition<T, P>) {
  // Helper function to convert TypedDataParameter to MessageTypeProperty
  function convertToMessageTypeProperty(
    param: TypedDataParameter,
  ): MessageTypeProperty {
    return {
      name: param.name,
      type: param.type,
    };
  }

  // Ensure the types property is correctly formatted
  const types: MessageTypes = {};

  // Use type assertion to treat typedDataDef.types as a safe type
  const safeTypes = typedDataDef.types as Record<
    string,
    readonly TypedDataParameter[] | undefined
  >;

  for (const [key, value] of Object.entries(safeTypes)) {
    if (Array.isArray(value)) {
      types[key] = value.map(convertToMessageTypeProperty);
    } else if (value && typeof value === 'object') {
      types[key] = Object.entries(value).map(([name, type]) => ({
        name,
        type: typeof type === 'string' ? type : type.type,
      }));
    }
  }

  // Construct the result object
  const result = {
    types,
    primaryType: typedDataDef.primaryType as string,
    domain: convertBigIntToString(typedDataDef.domain) ?? {},
    message:
      typedDataDef.primaryType === 'EIP712Domain'
        ? {}
        : convertBigIntToString(
            typedDataDef.message as Record<string, unknown>,
          ),
  };

  return result;
}

export async function getSmartAccountAddressFromInitialSigner<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  initialSigner: Address,
  publicClient: PublicClient<Transport, chain>,
): Promise<Hex> {
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

export async function isSmartAccountDeployed<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  publicClient: PublicClient<Transport, chain>,
  address: Hex,
): Promise<boolean> {
  try {
    const bytecode = await publicClient.getCode({
      address: address,
    });
    return bytecode !== null && bytecode !== '0x' && bytecode !== undefined;
  } catch (error) {
    console.error('Error checking address:', error);
    return false;
  }
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
