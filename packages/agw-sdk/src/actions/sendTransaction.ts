import {
  type Account,
  type Address,
  type Chain,
  type Client,
  encodeFunctionData,
  type Hex,
  keccak256,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  toBytes,
  type Transport,
  type WalletClient,
} from 'viem';
import { BaseError } from 'viem';
import { getChainId, sendRawTransaction } from 'viem/actions';
import {
  assertCurrentChain,
  getAction,
  getTransactionError,
  type GetTransactionErrorParameters,
  parseAccount,
} from 'viem/utils';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import AccountFactoryAbi from '../abis/AccountFactory.js';
import {
  BATCH_CALLER_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import { AccountNotFoundError } from '../errors/account.js';
import { type Call } from '../types/call.js';
import { getInitializerCalldata, isSmartAccountDeployed } from '../utils.js';
import { prepareTransactionRequest } from './prepareTransaction.js';
import { signTransaction } from './signTransaction.js';

export interface SendTransactionBatchParameters<
  request extends SendTransactionRequest<Chain> = SendTransactionRequest<Chain>,
> {
  // TODO: figure out if more fields need to be lifted up
  calls: SendEip712TransactionParameters<Chain, Account, Chain, request>[];
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
}

export async function sendTransactionBatch<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendTransactionBatchParameters<request>,
  validatorAddress: Hex,
): Promise<SendTransactionReturnType> {
  if (parameters.calls.length === 0) {
    throw new Error('No calls provided');
  }

  const calls: Call[] = parameters.calls.map((tx) => {
    if (!tx.to) throw new Error('Transaction target (to) is required');
    return {
      target: tx.to,
      allowFailure: false,
      value: BigInt(tx.value ?? 0),
      callData: tx.data ?? '0x',
    };
  });

  const batchCallData = encodeFunctionData({
    abi: [
      {
        name: 'batchCall',
        type: 'function',
        inputs: [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' },
            ],
          },
        ],
        outputs: [],
      },
    ],
    args: [calls],
  });

  // Get cumulative value passed in
  const totalValue = calls.reduce(
    (sum, call) => sum + BigInt(call.value),
    BigInt(0),
  );

  let batchTransaction;

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    const initialCall = {
      target: BATCH_CALLER_ADDRESS,
      allowFailure: false,
      value: totalValue,
      callData: batchCallData,
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      validatorAddress,
      initialCall,
    );
    const addressBytes = toBytes(signerClient.account.address);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    batchTransaction = {
      to: SMART_ACCOUNT_FACTORY_ADDRESS,
      data: deploymentCalldata,
      value: totalValue,
      paymaster: parameters.paymaster,
      paymasterInput: parameters.paymasterInput,
      type: 'eip712',
    } as any;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      batchTransaction,
      validatorAddress,
      true,
    );
  } else {
    batchTransaction = {
      to: BATCH_CALLER_ADDRESS as Hex,
      data: batchCallData,
      value: totalValue,
      paymaster: parameters.paymaster,
      paymasterInput: parameters.paymasterInput,
      type: 'eip712',
    } as any;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      batchTransaction,
      validatorAddress,
      false,
    );
  }
}

export async function sendTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  const request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >,
  validatorAddress: Hex,
): Promise<SendEip712TransactionReturnType> {
  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    const initialCall = {
      target: parameters.to,
      allowFailure: false,
      value: parameters.value ?? 0,
      callData: parameters.data ?? '0x',
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      validatorAddress,
      initialCall,
    );
    const addressBytes = toBytes(signerClient.account.address);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    // Override transaction fields
    parameters.to = SMART_ACCOUNT_FACTORY_ADDRESS;
    parameters.data = deploymentCalldata;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      parameters,
      validatorAddress,
      true,
    );
  } else {
    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      parameters,
      validatorAddress,
      false,
    );
  }
}

export async function _sendTransaction<
  const request extends SendTransactionRequest<chain, chainOverride>,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >,
  validatorAddress: Hex,
  isInitialTransaction: boolean,
): Promise<SendEip712TransactionReturnType> {
  const { chain = client.chain } = parameters;

  if (!signerClient.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    });
  const account = parseAccount(signerClient.account);

  try {
    // assertEip712Request(parameters)

    // Prepare the request for signing (assign appropriate fees, etc.)
    const request = await prepareTransactionRequest(
      client,
      signerClient,
      publicClient,
      {
        ...parameters,
        parameters: ['gas', 'nonce', 'fees'],
      } as any,
      isInitialTransaction,
    );

    let chainId: number | undefined;
    if (chain !== null) {
      chainId = await getAction(signerClient, getChainId, 'getChainId')({});
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      });
    }

    const serializedTransaction = await signTransaction(
      client,
      signerClient,
      {
        ...request,
        chainId,
      } as any,
      validatorAddress,
      isInitialTransaction,
    );

    return await getAction(
      client,
      sendRawTransaction,
      'sendRawTransaction',
    )({
      serializedTransaction,
    });
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...(parameters as GetTransactionErrorParameters),
      account,
      chain: chain as Chain,
    });
  }
}
