import {
  type Account,
  type Address,
  type Client,
  encodeFunctionData,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  type Transport,
  type WalletClient,
} from 'viem';
import { type ChainEIP712 } from 'viem/zksync';

import AGWAccountAbi from '../abis/AGWAccount.js';
import { EOA_VALIDATOR_ADDRESS } from '../constants.js';
import { type Call } from '../types/call.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import type { SendTransactionBatchParameters } from '../types/sendTransactionBatch.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

export function getBatchTransactionObject<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(address: Address, parameters: SendTransactionBatchParameters<request>) {
  const { calls, paymaster, paymasterInput } = parameters;
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
    abi: AGWAccountAbi,
    functionName: 'batchCall',
    args: [batchCalls],
  });

  // Get cumulative value passed in
  const totalValue = batchCalls.reduce(
    (sum, call) => sum + BigInt(call.value),
    BigInt(0),
  );

  const batchTransaction = {
    to: address,
    data: batchCallData,
    value: totalValue,
    paymaster: paymaster,
    paymasterInput: paymasterInput,
    type: 'eip712',
  } as any;

  return batchTransaction;
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
  const { calls, ...rest } = parameters;
  if (calls.length === 0) {
    throw new Error('No calls provided');
  }
  if (isPrivyCrossApp) {
    return await sendPrivyTransaction(client, parameters);
  }

  const batchTransaction = getBatchTransactionObject(
    client.account.address,
    parameters,
  );

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    {
      ...batchTransaction,
      ...rest,
    },
    EOA_VALIDATOR_ADDRESS,
    {},
    customPaymasterHandler,
  );
}
