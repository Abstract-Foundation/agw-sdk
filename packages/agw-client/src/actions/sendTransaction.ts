import {
  type Account,
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

import { EOA_VALIDATOR_ADDRESS } from '../constants.js';
import type {
  CustomPaymasterHandler,
  PaymasterArgs,
} from '../types/customPaymaster.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

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
    return await sendPrivyTransaction(client, updatedParameters);
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
