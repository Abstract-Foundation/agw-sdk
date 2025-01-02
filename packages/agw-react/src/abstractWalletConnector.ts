import {
  transformEIP1193Provider,
  validChains,
} from '@abstract-foundation/agw-client';
import { toPrivyWalletConnector } from '@privy-io/cross-app-connect/rainbow-kit';
import type { WalletDetailsParams } from '@rainbow-me/rainbowkit/dist/wallets/Wallet.js';
import { type CreateConnectorFn } from '@wagmi/core';
import {
  type EIP1193EventMap,
  type EIP1193RequestFn,
  type EIP1474Methods,
  http,
  type Transport,
} from 'viem';

import { AGW_APP_ID, ICON_URL } from './constants.js';

interface AbstractWalletConnectorOptions {
  /** RainbowKit connector details */
  rkDetails: WalletDetailsParams;
  /** Override transports for chains */
  overrideTransports: Record<number, Transport>;
}

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
  options: Partial<AbstractWalletConnectorOptions> = {},
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
  const { rkDetails, overrideTransports } = options;

  return (params) => {
    const chains = [...params.chains];
    let defaultChain = params.chains[0];
    const validChainIds = Object.keys(validChains).map(Number).sort();
    for (const chainId of validChainIds) {
      const chainIndex = chains.findIndex((chain) => chain.id === chainId);
      const hasChain = chainIndex !== -1;
      if (hasChain) {
        const removedChains = chains.splice(chainIndex, 1);
        defaultChain = removedChains[0] ?? defaultChain;
        break;
      }
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
      const provider = await connector.getProvider({
        chainId,
      });

      const providerChainId = await provider.request({
        method: 'eth_chainId',
      });

      let transport: Transport | undefined;
      if (validChains[Number(providerChainId)] === undefined) {
        // Transport is not overridden but provider is not on a supported chain,
        // use default http transport
        transport = overrideTransports?.[chainId] ?? http();
      }

      return transformEIP1193Provider({
        provider,
        chain,
        transport,
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
