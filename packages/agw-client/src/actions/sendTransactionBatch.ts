import {
  type Account,
  type Client,
  encodeFunctionData,
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
} from 'viem/zksync';

import AccountFactoryAbi from '../abis/AccountFactory.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import { type Call } from '../types/call.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import type { SendTransactionBatchParameters } from '../types/sendTransactionBatch.js';
import { getInitializerCalldata, isSmartAccountDeployed } from '../utils.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

async function getBatchCalldata<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  calls: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >[],
) {
  const batchCalls: Call[] = calls.map((tx) => {
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
    args: [batchCalls],
  });

  // Get cumulative value passed in
  const totalValue = batchCalls.reduce(
    (sum, call) => sum + BigInt(call.value),
    BigInt(0),
  );

  return {
    batchCallData,
    totalValue,
  };
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
  isPrivyCrossApp = false,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendTransactionReturnType> {
  const { calls, paymaster, paymasterInput, ...rest } = parameters;
  if (calls.length === 0) {
    throw new Error('No calls provided');
  }
  if (isPrivyCrossApp) {
    return await sendPrivyTransaction(client, parameters);
  }

  const { batchCallData, totalValue } = await getBatchCalldata(calls);

  let batchTransaction;

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    const initialCall = {
      target: client.account.address,
      allowFailure: false,
      value: totalValue,
      callData: batchCallData,
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      EOA_VALIDATOR_ADDRESS,
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
      paymaster: paymaster,
      paymasterInput: paymasterInput,
      type: 'eip712',
    } as any;
  } else {
    batchTransaction = {
      to: client.account.address,
      data: batchCallData,
      value: totalValue,
      paymaster: paymaster,
      paymasterInput: paymasterInput,
      type: 'eip712',
    } as any;
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    {
      ...batchTransaction,
      ...rest,
    },
    EOA_VALIDATOR_ADDRESS,
    !isDeployed,
    {},
    customPaymasterHandler,
  );
}
