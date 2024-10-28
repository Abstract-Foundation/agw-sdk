import {
  type Account,
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
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import AccountFactoryAbi from '../abis/AccountFactory.js';
import {
  BATCH_CALLER_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
  VALIDATOR_ADDRESS,
} from '../constants.js';
import { type Call } from '../types/call.js';
import type { SendTransactionBatchParameters } from '../types/sendTransactionBatch.js';
import { getInitializerCalldata, isSmartAccountDeployed } from '../utils.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

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
  isPrivyCrossApp = false,
): Promise<SendTransactionReturnType> {
  if (parameters.calls.length === 0) {
    throw new Error('No calls provided');
  }
  if (isPrivyCrossApp) {
    return await sendPrivyTransaction(client, parameters);
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
      VALIDATOR_ADDRESS,
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
  } else {
    batchTransaction = {
      to: BATCH_CALLER_ADDRESS as Hex,
      data: batchCallData,
      value: totalValue,
      paymaster: parameters.paymaster,
      paymasterInput: parameters.paymasterInput,
      type: 'eip712',
    } as any;
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    batchTransaction,
    !isDeployed,
  );
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
  isPrivyCrossApp = false,
): Promise<SendEip712TransactionReturnType> {
  if (isPrivyCrossApp) return await sendPrivyTransaction(client, parameters);

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
      VALIDATOR_ADDRESS,
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
    parameters.value = 0n;
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    parameters,
    !isDeployed,
  );
}
