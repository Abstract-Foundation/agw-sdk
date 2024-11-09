import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { http, type Transport } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { createConfig, WagmiProvider } from 'wagmi';

import { abstractWalletConnector } from './abstractWalletConnector.js';

interface AbstractWalletConfig {
  /**
   * Determines whether to use abstract testnet
   * @type {boolean}
   * @default false
   */
  testnet?: boolean;
  /**
   * Optional transport for the client.
   * @type {Transport}
   * @default http()
   */
  transport?: Transport;
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
 *   const config = {
 *     testnet: true,
 *     transport: http("https://your.abstract.node.example.com/rpc")
 *   };
 *   return (
 *     <AbstractWalletProvider config={config}>
 *       <Component {...pageProps} />
 *     </AbstractWalletProvider>
 *   );
 * };
 * ```
 * @param {AbstractWalletConfig} config - The configuration for the AbstractWalletProvider.
 */
export const AbstractWalletProvider = ({
  config = {
    testnet: false,
    transport: http(),
  },
  children,
}: React.PropsWithChildren<{ config: AbstractWalletConfig }>) => {
  const { testnet = false, transport } = config;
  // TODO: replace with mainnet when we have the configuration
  const chain = testnet ? abstractTestnet : abstractTestnet;

  const wagmiConfig = createConfig({
    chains: [chain],
    ssr: true,
    connectors: [abstractWalletConnector()],
    transports: {
      [chain.id]: transport ?? http(),
    },
    multiInjectedProviderDiscovery: false,
  });

  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
};
