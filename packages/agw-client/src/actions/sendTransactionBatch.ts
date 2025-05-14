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
import type { SignTransactionBatchParameters } from '../types/signTransactionBatch.js';
import { signPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

export function getBatchTransactionObject<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  address: Address,
  parameters:
    | SendTransactionBatchParameters<request>
    | SignTransactionBatchParameters<chain, account, chainOverride>,
) {
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

/**
 * Function to send a batch of transactions in a single call using the connected Abstract Global Wallet.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { encodeFunctionData, parseUnits } from "viem";
 *
 * export default function SendTransactionBatch() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function sendTransactionBatch() {
 *     if (!agwClient) return;
 *
 *     // Batch multiple transactions in a single call
 *     const hash = await agwClient.sendTransactionBatch({
 *       calls: [
 *         // 1. Simple ETH transfer
 *         {
 *           to: "0x1234567890123456789012345678901234567890",
 *           value: parseUnits("0.1", 18), // 0.1 ETH
 *         },
 *         // 2. Contract interaction
 *         {
 *           to: "0xabcdef0123456789abcdef0123456789abcdef01",
 *           data: encodeFunctionData({
 *             abi: [
 *               {
 *                 name: "transfer",
 *                 type: "function",
 *                 inputs: [
 *                   { name: "to", type: "address" },
 *                   { name: "amount", type: "uint256" }
 *                 ],
 *                 outputs: [{ type: "bool" }],
 *                 stateMutability: "nonpayable"
 *               }
 *             ],
 *             functionName: "transfer",
 *             args: ["0x9876543210987654321098765432109876543210", parseUnits("10", 18)]
 *           })
 *         }
 *       ]
 *     });
 *
 *     console.log("Transaction hash:", hash);
 *   }
 * }
 * ```
 *
 * @param parameters - Parameters for sending a batch of transactions
 * @param parameters.calls - An array of transaction requests. Each transaction can include:
 *   - to: The recipient address (required)
 *   - from: The sender address (defaults to the AGW address)
 *   - data: Contract code or method call with encoded args
 *   - gas: Gas provided for execution
 *   - nonce: Unique transaction identifier
 *   - value: Amount in wei to send
 *   - maxFeePerGas: Total fee per gas
 *   - maxPriorityFeePerGas: Priority fee per gas
 *   - gasPerPubdata: Gas per byte of data
 *   - factoryDeps: Bytecodes of contract dependencies
 *   - customSignature: Custom transaction signature
 *   - type: Transaction type
 * @param parameters.paymaster - Address of the paymaster smart contract that will pay the gas fees
 * @param parameters.paymasterInput - Input data to the paymaster
 * @returns The transaction hash of the submitted transaction batch
 */
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
    const signedTx = await signPrivyTransaction(client, parameters as any);
    return await publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    });
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
