import {
  type LoginMethodOrderOption,
  PrivyProvider,
  type PrivyProviderProps,
} from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { type Transport } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { createConfig, http, WagmiProvider } from 'wagmi';

import { AGW_APP_ID } from '../constants.js';
import { InjectWagmiConnector } from './injectWagmiConnector.js';

const privyAppLoginMethod: LoginMethodOrderOption = `privy:${AGW_APP_ID}`;

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

  if (!props.config) {
    props.config = {
      loginMethodsAndOrder: {
        primary: [privyAppLoginMethod],
      },
    };
  } else if (!props.config.loginMethodsAndOrder) {
    props.config.loginMethodsAndOrder = {
      primary: [privyAppLoginMethod],
    };
  } else {
    if (
      // check if the privy app login method is in the primary or overflow list
      !(
        props.config.loginMethodsAndOrder.primary.includes(
          privyAppLoginMethod,
        ) ||
        (props.config.loginMethodsAndOrder.overflow &&
          props.config.loginMethodsAndOrder.overflow.includes(
            privyAppLoginMethod,
          ))
      )
    ) {
      props.config.loginMethodsAndOrder.primary = [
        privyAppLoginMethod,
        ...props.config.loginMethodsAndOrder.primary,
      ];
    }
  }
  return (
    <PrivyProvider {...props}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <InjectWagmiConnector chain={chain}>
            {props.children}
          </InjectWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </PrivyProvider>
  );
};
