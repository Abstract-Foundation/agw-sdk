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
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import {
  encodeSessionWithPeriodIds,
  getPeriodIdsForTransaction,
  type SessionConfig,
} from '../sessions.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

export interface SendTransactionForSessionParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
> {
  parameters: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >;
  session: SessionConfig;
}

export async function sendTransactionForSession<
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
  session: SessionConfig,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendEip712TransactionReturnType> {
  const selector: Hex | undefined = parameters.data
    ? `0x${parameters.data.slice(2, 10)}`
    : undefined;

  if (!parameters.to) {
    throw new BaseError('Transaction to field is not specified');
  }
  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    parameters,
    SESSION_KEY_VALIDATOR_ADDRESS,
    {
      [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(
        session,
        getPeriodIdsForTransaction({
          sessionConfig: session,
          target: parameters.to,
          selector,
          timestamp: BigInt(Math.floor(Date.now() / 1000)),
        }),
      ),
    },
    customPaymasterHandler,
  );
}
