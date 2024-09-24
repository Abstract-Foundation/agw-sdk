import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { http } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { createConfig, WagmiProvider } from 'wagmi';

import { abstractWalletConnector } from './abstractWalletConnector.js';

interface AbstractWalletProviderProps {
  testnet?: boolean;
}

export const AbstractWalletProvider = ({
  testnet = false,
  children,
}: React.PropsWithChildren<AbstractWalletProviderProps>) => {
  // TODO: replace with mainnet when we have the configuration
  const chain = testnet ? abstractTestnet : abstractTestnet;

  const config = createConfig({
    chains: [chain],
    ssr: true,
    connectors: [abstractWalletConnector()],
    transports: {
      [chain.id]: http(),
    },
    multiInjectedProviderDiscovery: false,
  });

  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};
