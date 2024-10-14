import { PrivyProvider, type PrivyProviderProps } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { type Transport } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { createConfig, http, WagmiProvider } from 'wagmi';

import { InjectWagmiConnector } from './injectWagmiConnector.js';

/**
 * Configuration options for the AbstractPrivyProvider.
 * @interface AgwPrivyProviderProps
 * @extends PrivyProviderProps
 * @property {boolean} testnet - Whether to use abstract testnet, defaults to false.
 * @property {Transport} transport - Optional transport to use, defaults to standard http.
 */
interface AgwPrivyProviderProps extends PrivyProviderProps {
  testnet?: boolean;
  transport?: Transport;
}

export const AbstractPrivyProvider = ({
  testnet = false,
  transport,
  ...props
}: AgwPrivyProviderProps) => {
  const chain = testnet ? abstractTestnet : abstractTestnet;

  const wagmiConfig = createConfig({
    chains: [chain],
    ssr: true,
    connectors: [],
    transports: {
      [chain.id]: transport ?? http(),
    },
    multiInjectedProviderDiscovery: false,
  });
  const queryClient = new QueryClient();
  return (
    <PrivyProvider {...props}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <InjectWagmiConnector
            testnet={testnet}
            transport={transport ?? http()}
          >
            {props.children}
          </InjectWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
};
