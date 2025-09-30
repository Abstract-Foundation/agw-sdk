import {
  type ChainIdToCapabilities,
  type Client,
  type ExtractCapabilities,
  type GetCapabilitiesParameters,
  type GetCapabilitiesReturnType,
  type Transport,
  UnsupportedChainIdError,
} from 'viem';
import { agwCapabilities } from '../eip5792.js';
import { VALID_CHAINS } from '../utils.js';

/**
 * Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
 *
 * - Docs: https://viem.sh/docs/actions/wallet/getCapabilities
 * - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { getCapabilities } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const capabilities = await getCapabilities(client)
 */
export async function getCapabilities<
  chainId extends number | undefined = undefined,
>(
  _client: Client<Transport>,
  parameters: GetCapabilitiesParameters<chainId> = {},
): Promise<GetCapabilitiesReturnType<chainId>> {
  const { chainId } = parameters;

  const capabilities = {} as ChainIdToCapabilities<
    ExtractCapabilities<'getCapabilities', 'ReturnType'>,
    number
  >;
  if (chainId) {
    if (!VALID_CHAINS[chainId]) {
      throw new UnsupportedChainIdError(
        new Error(`Chain ${chainId} not supported`),
      );
    }
    return agwCapabilities as never;
  }

  for (const chainId of Object.keys(VALID_CHAINS)) {
    capabilities[Number(chainId)] = agwCapabilities;
  }
  return capabilities as never;
}
