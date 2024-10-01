import {
  type Account,
  type Address,
  type Chain,
  createClient,
  type ParseAccount,
  type PublicClient,
  type PublicClientConfig,
  type RpcSchema,
  type Transport,
} from 'viem';

import { abstractPublicActions } from './abstractPublicActions';

/**
 * Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
 *
 * - Docs: https://viem.sh/docs/clients/public
 *
 * A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
 *
 * @param config - {@link PublicClientConfig}
 * @returns A Public Client. {@link PublicClient}
 *
 * @example
 * import { createPublicClient, http } from 'viem'
 * import { mainnet } from 'viem/chains'
 *
 * const client = createPublicClient({
 *   chain: mainnet,
 *   transport: http(),
 * })
 */
export function createAbstractPublicClient<
  transport extends Transport,
  chain extends Chain,
  accountOrAddress extends Account | Address | undefined = undefined,
  rpcSchema extends RpcSchema | undefined = undefined,
>(
  parameters: PublicClientConfig<transport, chain, accountOrAddress, rpcSchema>,
): PublicClient<transport, chain, ParseAccount<accountOrAddress>, rpcSchema> {
  const { key = 'abs-public', name = 'Abstract Public Client' } = parameters;
  const client = createClient({
    ...parameters,
    key,
    name,
    type: 'abstractPublicClient',
  });
  return client.extend(abstractPublicActions) as any;
}
