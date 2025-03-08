import {
  type Account,
  type Address,
  BaseError,
  type Chain,
  type Client,
  type Hex,
  type PublicClient,
  type SendTransactionRequest,
  type Transport,
  type WalletClient,
} from 'viem';
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

import { INSUFFICIENT_BALANCE_SELECTOR } from '../constants.js';
import { AccountNotFoundError } from '../errors/account.js';
import { InsufficientBalanceError } from '../errors/insufficientBalance.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { prepareTransactionRequest } from './prepareTransaction.js';
import { signTransaction } from './signTransaction.js';

export async function sendTransactionInternal<
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
  validator: Address,
  validationHookData: Record<string, Hex> = {},
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
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
      publicClient,
      {
        ...request,
        chainId,
      } as any,
      validator,
      validationHookData,
      customPaymasterHandler,
    );
    return await getAction(
      client,
      sendRawTransaction,
      'sendRawTransaction',
    )({
      serializedTransaction,
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
      account,
      chain: chain as Chain,
    });
  }
}
