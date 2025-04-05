import {
  type CustomPaymasterHandler,
  validChains,
} from '@abstract-foundation/agw-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { type Chain, http, type Transport } from 'viem';
import { createConfig, WagmiProvider } from 'wagmi';

import { abstractWalletConnector } from './abstractWalletConnector.js';

interface AbstractWalletConfig {
  /**
   * Determines whether to use abstract testnet
   * @type {boolean}
   * @default false
   */
  chain: Chain;
  /**
   * Optional transport for the client.
   * @type {Transport}
   * @default http()
   */
  transport?: Transport;
  /**
   * Optional query client.
   * @type {QueryClient}
   * @default new QueryClient()
   */
  queryClient?: QueryClient;
  /**
   * Optional custom paymaster handler.
   * @type {CustomPaymasterHandler}
   */
  customPaymasterHandler?: CustomPaymasterHandler;
}

/**
 * AbstractWalletProvider is a React provider that wraps the WagmiProvider and QueryClientProvider.
 * It provides the AbstractWalletContext to its children.
 * @example
 * ```tsx
 * import { AbstractWalletProvider } from '@abstractwallet/agw-react';
 *
 * const App = () => {
 *   // optional configuration overrides
 *   const transport = http("https://your.abstract.node.example.com/rpc")
 *   const queryClient = new QueryClient()
 *   return (
 *     <AbstractWalletProvider chain={abstractTestnet} transport={transport} queryClient={queryClient}>
 *       <Component {...pageProps} />
 *     </AbstractWalletProvider>
 *   );
 * };
 * ```
 * @param {AbstractWalletConfig} config - The configuration for the AbstractWalletProvider.
 */
export const AbstractWalletProvider = ({
  chain,
  transport,
  queryClient = new QueryClient(),
  customPaymasterHandler,
  children,
}: React.PropsWithChildren<AbstractWalletConfig>) => {
  if (!validChains[chain.id]) {
    throw new Error(`Chain ${chain.id} is not supported`);
  }

  const wagmiConfig = useMemo(() => {
    return createConfig({
      chains: [chain],
      ssr: true,
      connectors: [
        abstractWalletConnector({
          customPaymasterHandler,
        }),
      ],
      transports: {
        [chain.id]: transport ?? http(),
      },
      multiInjectedProviderDiscovery: false,
    });
  }, [chain, transport, customPaymasterHandler]);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
