import {
  type Account,
  BaseError,
  type Client,
  type Hex,
  type PublicClient,
  type SendTransactionRequest,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  type SendTransactionSyncReturnType,
  sendRawTransactionSync,
} from 'viem/actions';
import { getAction } from 'viem/utils';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
} from 'viem/zksync';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import {
  encodeSessionWithPeriodIds,
  getPeriodIdsForTransaction,
  type SessionConfig,
} from '../sessions.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';
import type { SendEip712TransactionSyncParameters } from './sendTransactionSync.js';

export async function sendTransactionForSessionSync<
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
  session: SessionConfig,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendTransactionSyncReturnType<ChainEIP712>> {
  const { throwOnReceiptRevert, timeout, ...txParameters } = parameters;

  const selector: Hex | undefined = txParameters.data
    ? `0x${txParameters.data.slice(2, 10)}`
    : undefined;

  if (!txParameters.to) {
    throw new BaseError('Transaction to field is not specified');
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
    SESSION_KEY_VALIDATOR_ADDRESS,
    {
      [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(
        session,
        getPeriodIdsForTransaction({
          sessionConfig: session,
          target: txParameters.to,
          selector,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
        }),
      ),
    },
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
