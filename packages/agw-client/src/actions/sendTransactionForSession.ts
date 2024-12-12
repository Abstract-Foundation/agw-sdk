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
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { encodeSessionWithPeriodIds, type SessionConfig } from '../sessions.js';
import { isSmartAccountDeployed } from '../utils.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
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
  isPrivyCrossApp = false,
): Promise<SendEip712TransactionReturnType> {
  if (isPrivyCrossApp) return await sendPrivyTransaction(client, parameters);

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    throw new BaseError('Smart account not deployed');
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    parameters,
    SESSION_KEY_VALIDATOR_ADDRESS,
    !isDeployed,
    {
      [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(session, []),
    },
  );
}
