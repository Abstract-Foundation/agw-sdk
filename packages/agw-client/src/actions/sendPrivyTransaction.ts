import {
  type Account,
  type Client,
  type Hex,
  type SendTransactionRequest,
  type SignMessageParameters,
  type SignTypedDataParameters,
  toHex,
  type Transport,
} from 'viem';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SignEip712TransactionReturnType,
} from 'viem/zksync';

import { replaceBigInts } from '../replaceBigInts.js';
import type { SendTransactionBatchParameters } from '../types/sendTransactionBatch.js';

export async function sendPrivyTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  const request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  parameters:
    | SendEip712TransactionParameters<chain, account, chainOverride, request>
    | SendTransactionBatchParameters<request>,
): Promise<SignEip712TransactionReturnType> {
  const result = (await client.request(
    {
      method: 'privy_sendSmartWalletTx',
      params: [replaceBigInts(parameters, toHex)],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { retryCount: 0 },
  )) as any;
  return result;
}

export async function sendPrivySignMessage(
  client: Client<Transport, ChainEIP712, Account>,
  parameters: Omit<SignMessageParameters, 'account'>,
): Promise<Hex> {
  const result = (await client.request(
    {
      method: 'privy_signSmartWalletMessage',
      params: [parameters.message],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { retryCount: 0 },
  )) as any;
  return result;
}

export async function sendPrivySignTypedData(
  client: Client<Transport, ChainEIP712, Account>,
  parameters: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
): Promise<Hex> {
  const result = (await client.request(
    {
      method: 'privy_signSmartWalletTypedData',
      params: [client.account.address, parameters],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { retryCount: 0 },
  )) as any;
  return result;
}
