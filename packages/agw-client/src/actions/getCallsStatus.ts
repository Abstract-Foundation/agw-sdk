import {
  type Account,
  type Chain,
  type Client,
  type FormattedTransactionReceipt,
  type GetCallsStatusParameters,
  type GetCallsStatusReturnType,
  type Hex,
  InvalidParameterError,
  isHex,
  TransactionReceiptNotFoundError,
  type Transport,
} from 'viem';
import { getTransactionReceipt } from 'viem/actions';

/**
 * Returns the status of a call batch that was sent via `sendCalls`.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getCallsStatus
 * - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Status of the calls. {@link GetCallsStatusReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCallsStatus } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const { receipts, status } = await getCallsStatus(client, { id: '0xdeadbeef' })
 */
export async function getCallsStatus<
  chain extends Chain,
  account extends Account | undefined = undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetCallsStatusParameters,
): Promise<GetCallsStatusReturnType> {
  if (!isHex(parameters.id)) {
    throw new InvalidParameterError({ param: 'id' });
  }
  let receipt: FormattedTransactionReceipt<chain> | undefined;
  try {
    receipt = await getTransactionReceipt(client, {
      hash: parameters.id as Hex,
    });
  } catch (error) {
    if (error instanceof TransactionReceiptNotFoundError) {
      receipt = undefined;
    } else {
      throw error;
    }
  }

  const [status, statusCode] = (() => {
    if (!receipt) return ['pending', 100] as const;
    if (receipt.status === 'success') return ['success', 200] as const;
    if (receipt.status === 'reverted') return ['failure', 500] as const;
    return [undefined, 400] as const;
  })();

  return {
    atomic: true,
    chainId: client.chain.id,
    receipts: receipt ? [receipt] : undefined,
    status: status,
    id: parameters.id,
    statusCode,
    version: '2.0.0',
  };
}
