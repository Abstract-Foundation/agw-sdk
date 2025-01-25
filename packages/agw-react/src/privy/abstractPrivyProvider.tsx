import { validChains } from '@abstract-foundation/agw-client';
import {
  type LoginMethodOrderOption,
  PrivyProvider,
  type PrivyProviderProps,
} from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { type Chain, type Transport } from 'viem';
import { createConfig, http, WagmiProvider } from 'wagmi';

import { AGW_APP_ID } from '../constants.js';
import { InjectWagmiConnector } from './injectWagmiConnector.js';

export const agwAppLoginMethod: LoginMethodOrderOption = `privy:${AGW_APP_ID}`;

/**
 * Configuration options for the AbstractPrivyProvider.
 * @interface AgwPrivyProviderProps
 * @extends PrivyProviderProps
 * @property {boolean} testnet - Whether to use abstract testnet, defaults to false.
 * @property {Transport} transport - Optional transport to use, defaults to standard http.
 */
interface AgwPrivyProviderProps extends PrivyProviderProps {
  chain: Chain;
  transport?: Transport;
}

export const AbstractPrivyProvider = ({
  chain,
  transport,
  ...props
}: AgwPrivyProviderProps) => {
  if (!validChains[chain.id]) {
    throw new Error(`Chain ${chain.id} is not supported`);
  }

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

  // if no login methods and order are provided, set the default login method to the privy app login method
  if (!props.config) {
    props.config = {
      loginMethodsAndOrder: {
        primary: [agwAppLoginMethod],
      },
    };
  } else if (!props.config.loginMethodsAndOrder) {
    props.config.loginMethodsAndOrder = {
      primary: [agwAppLoginMethod],
    };
  }
  return (
    <PrivyProvider {...props}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <InjectWagmiConnector chain={chain} transport={transport}>
            {props.children}
          </InjectWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
};
