import {
  transformEIP1193Provider,
  validChains,
} from '@abstract-foundation/agw-client';
import { toPrivyWalletConnector } from '@privy-io/cross-app-connect/rainbow-kit';
import type { WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { type CreateConnectorFn } from '@wagmi/core';
import {
  type EIP1193EventMap,
  type EIP1193RequestFn,
  type EIP1474Methods,
} from 'viem';
import { abstractTestnet } from 'viem/chains';

import { AGW_APP_ID, ICON_URL } from './constants.js';

/**
 * Create a wagmi connector for the Abstract Global Wallet.
 *
 * Adapted from wagmi injected connector as a reference implementation:
 * https://github.com/wevm/wagmi/blob/main/packages/core/src/connectors/injected.ts#L94
 *
 * @example
 * import { createConfig, http } from "wagmi";
 * import { abstract } from "wagmi/chains";
 * import { abstractWalletConnector } from "@abstract-foundation/agw-react/connectors"
 *
 * export const wagmiConfig = createConfig({
 *   chains: [abstract],
 *   transports: {
 *     [abstract.id]: http(),
 *   },
 *   connectors: [abstractWalletConnector()],
 *   ssr: true,
 * });
 */
function abstractWalletConnector(
  rkDetails?: WalletDetailsParams,
  testnet = false,
): CreateConnectorFn<
  {
    on: <event extends keyof EIP1193EventMap>(
      event: event,
      listener: EIP1193EventMap[event],
    ) => void;
    removeListener: <event extends keyof EIP1193EventMap>(
      event: event,
      listener: EIP1193EventMap[event],
    ) => void;
    request: EIP1193RequestFn<EIP1474Methods>;
  },
  Record<string, unknown>,
  Record<string, unknown>
> {
  return (params) => {
    const defaultChain = testnet ? abstractTestnet : abstractTestnet; // TODO: add mainnet chain
    const chains = [...params.chains];
    const chainIndex = chains.findIndex(
      (chain) => chain.id === defaultChain.id,
    );
    const hasChain = chainIndex !== -1;
    if (hasChain) {
      chains.splice(chainIndex, 1);
    }

    const connector = toPrivyWalletConnector({
      iconUrl: ICON_URL,
      id: AGW_APP_ID,
      name: 'Abstract',
    })({
      ...params,
      chains: [defaultChain, ...chains],
    });

    const getAbstractProvider = async (
      parameters?: { chainId?: number | undefined } | undefined,
    ) => {
      const chainId = parameters?.chainId ?? defaultChain.id;
      const chain = validChains[chainId];
      if (!chain) {
        throw new Error('Unsupported chain');
      }
      const provider = await connector.getProvider(parameters);

      return transformEIP1193Provider({
        provider,
        chain,
        isPrivyCrossApp: true,
      });
    };

    const abstractConnector = {
      ...connector,
      ...rkDetails,
      getProvider: getAbstractProvider,
      type: 'injected',
      id: 'xyz.abs.privy',
    };
    return abstractConnector;
  };
}

export { abstractWalletConnector };
