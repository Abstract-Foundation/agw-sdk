import {
  Address,
  fromHex,
  Hex,
  toBytes,
  toFunctionSelector,
  zeroAddress,
} from 'viem';
import {
  createClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  keccak256,
  parseAbiParameters,
  serializeErc6492Signature,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { getCode } from 'viem/actions';
import { ChainEIP712 } from 'viem/zksync';
import { describe, expect, it, vi } from 'vitest';
vi.mock('viem/actions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    getCode: vi.fn(),
  };
});
import AccountFactoryAbi from '../../../src/abis/AccountFactory.js';
import { signTypedData } from '../../../src/actions/signTypedData.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SESSION_KEY_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../../../src/constants.js';
import { getInitializerCalldata } from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';
import { exampleTypedData } from '../../fixtures.js';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const baseClientRequestSpy = vi.fn(async ({ method, params }) => {
  console.log('method', method);
  if (method === 'privy_signSmartWalletTypedData') {
    return RAW_SIGNATURE;
  } else if (method === 'eth_call') {
    const callParams = params as {
      to: Address;
      data: Hex;
    }[];
    if (
      callParams[0].to === address.smartAccountAddress &&
      callParams[0].data.startsWith(
        toFunctionSelector('function listHooks(bool)'),
      )
    ) {
      console.log('returning listHooks');
      return encodeAbiParameters(parseAbiParameters(['address[]']), [
        [SESSION_KEY_VALIDATOR_ADDRESS],
      ]);
    }
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

signerClient.request = (async ({ method, params }) => {
  if (method === 'eth_signTypedData_v4') {
    return RAW_SIGNATURE;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

describe('signTypedData', async () => {
  it('should pass through zksync eip712 transaction', async () => {
    const signedMessage = await signTypedData(baseClient, signerClient, {
      domain: {
        name: 'zkSync',
        version: '2',
        chainId: 11124,
      },
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
        ],
        Transaction: [
          { name: 'txType', type: 'uint256' },
          { name: 'from', type: 'uint256' },
          { name: 'to', type: 'uint256' },
          { name: 'gasLimit', type: 'uint256' },
          { name: 'gasPerPubdataByteLimit', type: 'uint256' },
          { name: 'maxFeePerGas', type: 'uint256' },
          { name: 'maxPriorityFeePerGas', type: 'uint256' },
          { name: 'paymaster', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'value', type: 'uint256' },
          { name: 'data', type: 'bytes' },
          { name: 'factoryDeps', type: 'bytes32[]' },
          { name: 'paymasterInput', type: 'bytes' },
        ],
      },
      primaryType: 'Transaction',
      message: {
        txType: 113n,
        from: fromHex('0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 'bigint'),
        to: fromHex('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', 'bigint'),
        gasLimit: 200824n,
        gasPerPubdataByteLimit: 50000n,
        maxFeePerGas: 61775821n,
        maxPriorityFeePerGas: 0n,
        paymaster: 479727098668981938005249499649736900492014609297n,
        nonce: 18n,
        value: 0n,
        data: '0x',
        factoryDeps: [],
        paymasterInput: '0x',
      },
    });
    expect(signedMessage).toBe(
      encodeAbiParameters(parseAbiParameters(['bytes', 'address', 'bytes[]']), [
        RAW_SIGNATURE,
        EOA_VALIDATOR_ADDRESS,
        [],
      ]),
    );
  });
  it('should transform typed data to typed signature for deployed smart account', async () => {
    vi.mocked(getCode).mockResolvedValue('0xababab');
    const expectedSignature = encodeAbiParameters(
      parseAbiParameters(['bytes', 'address']),
      [RAW_SIGNATURE, EOA_VALIDATOR_ADDRESS],
    );

    const signedMessage = await signTypedData(
      baseClient,
      signerClient,
      exampleTypedData,
    );

    expect(signedMessage).toBe(expectedSignature);
  });
  it('should transform typed data to ERC-6492 typed signature for undeployed smart account', async () => {
    vi.mocked(getCode).mockResolvedValue(undefined);
    const expectedSignature = serializeErc6492Signature({
      address: SMART_ACCOUNT_FACTORY_ADDRESS,
      signature: encodeAbiParameters(parseAbiParameters(['bytes', 'address']), [
        RAW_SIGNATURE,
        EOA_VALIDATOR_ADDRESS,
      ]),
      data: encodeFunctionData({
        abi: AccountFactoryAbi,
        functionName: 'deployAccount',
        args: [
          keccak256(toBytes(address.signerAddress)),
          getInitializerCalldata(address.signerAddress, EOA_VALIDATOR_ADDRESS, {
            target: zeroAddress,
            allowFailure: false,
            callData: '0x',
            value: 0n,
          }),
        ],
      }),
    });

    const signedMessage = await signTypedData(
      baseClient,
      signerClient,
      exampleTypedData,
    );

    expect(signedMessage).toBe(expectedSignature);
  });
  it('should pass through privy cross app', async () => {
    const signedMessage = await signTypedData(
      baseClient,
      signerClient,
      exampleTypedData,
      true,
    );

    expect(signedMessage).toBe(RAW_SIGNATURE);

    expect(baseClientRequestSpy).toHaveBeenCalledWith(
      {
        method: 'privy_signSmartWalletTypedData',
        params: [address.smartAccountAddress, exampleTypedData],
      },
      { retryCount: 0 },
    );
  });
});
