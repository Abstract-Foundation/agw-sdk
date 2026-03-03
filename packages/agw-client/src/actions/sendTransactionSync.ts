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
  type SendTransactionSyncParameters,
  type SendTransactionSyncReturnType,
  sendRawTransactionSync,
} from 'viem/actions';
import {
  type GetTransactionErrorParameters,
  getAction,
  getTransactionError,
  parseAccount,
} from 'viem/utils';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
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

export type SendEip712TransactionSyncParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
> = SendEip712TransactionParameters<chain, account, chainOverride, request> &
  Pick<
    SendTransactionSyncParameters<chain>,
    'pollingInterval' | 'throwOnReceiptRevert' | 'timeout'
  >;

export async function sendTransactionSync<
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
  parameters: SendEip712TransactionSyncParameters<
    chain,
    account,
    chainOverride,
    request
  >,
  isPrivyCrossApp = false,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendTransactionSyncReturnType<ChainEIP712>> {
  const { throwOnReceiptRevert, timeout, ...txParameters } = parameters;

  if (isPrivyCrossApp) {
    try {
      let paymasterData: Partial<PaymasterArgs> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestAsAny = txParameters as any;
      if (
        customPaymasterHandler &&
        !requestAsAny.paymaster &&
        !requestAsAny.paymasterInput
      ) {
        paymasterData = await customPaymasterHandler({
          ...(txParameters as any),
          from: client.account.address,
          chainId: txParameters.chain?.id ?? client.chain.id,
        });
      }

      const updatedParameters = {
        ...txParameters,
        ...(paymasterData as any),
      };
      const signedTx = await signPrivyTransaction(client, updatedParameters);
      return await sendRawTransactionSync(publicClient, {
        serializedTransaction: signedTx,
        throwOnReceiptRevert,
        timeout,
      });
    } catch (err) {
      if (
        err instanceof Error &&
        err.message.includes(INSUFFICIENT_BALANCE_SELECTOR)
      ) {
        throw new InsufficientBalanceError();
      }
      throw getTransactionError(err as BaseError, {
        ...(txParameters as GetTransactionErrorParameters),
        account: txParameters.account
          ? parseAccount(txParameters.account)
          : null,
        chain: txParameters.chain ?? undefined,
      });
    }
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    txParameters as SendEip712TransactionParameters<
      chain,
      account,
      chainOverride,
      request
    >,
    EOA_VALIDATOR_ADDRESS,
    {},
    customPaymasterHandler,
    (serializedTransaction) =>
      getAction(
        client,
        sendRawTransactionSync,
        'sendRawTransactionSync',
      )({
        serializedTransaction,
        throwOnReceiptRevert,
        timeout,
      }),
  );
}
