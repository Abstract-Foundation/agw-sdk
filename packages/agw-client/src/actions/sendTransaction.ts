import {
  type Account,
  BaseError,
  type Client,
  type PublicClient,
  type SendTransactionRequest,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  getTransactionError,
  type GetTransactionErrorParameters,
  parseAccount,
} from 'viem/utils';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import {
  EOA_VALIDATOR_ADDRESS,
  INSUFFICIENT_BALANCE_SELECTOR,
} from '../constants.js';
import { InsufficientBalanceError } from '../errors/insufficientBalance.js';
import type {
  CustomPaymasterHandler,
  PaymasterArgs,
} from '../types/customPaymaster.js';
import { signPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

/**
 * Function to send a transaction using the connected Abstract Global Wallet.
 *
 * Transactions are signed by the approved signer account (EOA) of the Abstract Global Wallet
 * and sent from the AGW smart contract itself.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * export default function SendTransaction() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function sendTransaction() {
 *     if (!agwClient) return;
 *
 *     const hash = await agwClient.sendTransaction({
 *       to: "0x273B3527BF5b607dE86F504fED49e1582dD2a1C6",
 *       data: "0x69",
 *     });
 *   }
 * }
 * ```
 *
 * @param parameters - Transaction parameters
 * @param parameters.to - The recipient address of the transaction
 * @param parameters.from - The sender address of the transaction (defaults to the Abstract Global Wallet address)
 * @param parameters.data - Contract code or a hashed method call with encoded args
 * @param parameters.gas - Gas provided for transaction execution
 * @param parameters.nonce - Unique number identifying this transaction
 * @param parameters.value - Value in wei sent with this transaction
 * @param parameters.maxFeePerGas - Total fee per gas in wei (gasPrice/baseFeePerGas + maxPriorityFeePerGas)
 * @param parameters.maxPriorityFeePerGas - Max priority fee per gas (in wei)
 * @param parameters.gasPerPubdata - The amount of gas to pay per byte of data on Ethereum
 * @param parameters.factoryDeps - An array of bytecodes of contracts that are dependencies for the transaction
 * @param parameters.paymaster - Address of the paymaster smart contract that will pay the gas fees (requires paymasterInput)
 * @param parameters.paymasterInput - Input data to the paymaster (requires paymaster)
 * @param parameters.customSignature - Custom signature for the transaction
 * @param parameters.type - Transaction type. For EIP-712 transactions, this should be 'eip712'
 * @returns The transaction hash of the submitted transaction
 */
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
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendEip712TransactionReturnType> {
  if (isPrivyCrossApp) {
    try {
      let paymasterData: Partial<PaymasterArgs> = {};
      // SendEip712TransactionParameters doesn't actually have paymaster or paymasterInput fields
      // defined, so we just have to cast to any here to access them
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestAsAny = parameters as any;
      if (
        customPaymasterHandler &&
        !requestAsAny.paymaster &&
        !requestAsAny.paymasterInput
      ) {
        paymasterData = await customPaymasterHandler({
          ...(parameters as any),
          from: client.account.address,
          chainId: parameters.chain?.id ?? client.chain.id,
        });
      }

      const updatedParameters = {
        ...parameters,
        ...(paymasterData as any),
      };
      const signedTx = await signPrivyTransaction(client, updatedParameters);
      return await publicClient.sendRawTransaction({
        serializedTransaction: signedTx,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes(INSUFFICIENT_BALANCE_SELECTOR)
      ) {
        throw new InsufficientBalanceError();
      }
      throw getTransactionError(err as BaseError, {
        ...(parameters as GetTransactionErrorParameters),
        account: parameters.account ? parseAccount(parameters.account) : null,
        chain: parameters.chain ?? undefined,
      });
    }
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    parameters,
    EOA_VALIDATOR_ADDRESS,
    {},
    customPaymasterHandler,
  );
}
