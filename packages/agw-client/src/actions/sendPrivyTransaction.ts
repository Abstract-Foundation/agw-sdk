import {
  type Account,
  type Client,
  type SendTransactionRequest,
  type Transport,
} from 'viem';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SignEip712TransactionReturnType,
} from 'viem/zksync';

import type { SendTransactionBatchParameters } from '../types/sendTransactionBatch';

function convertBigIntToString(obj: any): any {
  if (typeof obj === 'bigint') {
    return '0x' + obj.toString(16); // Convert BigInt to hex string
  }
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      convertBigIntToString(value),
    ]),
  );
}

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
      params: [convertBigIntToString(parameters)],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any,
    { retryCount: 0 },
  )) as any;
  return result;
}
