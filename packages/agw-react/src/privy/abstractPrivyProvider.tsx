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
 * @property {QueryClient} queryClient - Optional query client to use, defaults to a standard query client.
 */
interface AgwPrivyProviderProps extends PrivyProviderProps {
  chain: Chain;
  transport?: Transport;
  queryClient?: QueryClient;
}

/**
 * Provider component that integrates Abstract Global Wallet with Privy authentication.
 *
 * This component wraps your application with the necessary providers to use Abstract Global Wallet
 * with Privy authentication, including:
 * - PrivyProvider: Handles user authentication and EOA creation
 * - WagmiProvider: Provides web3 functionality
 * - QueryClientProvider: Manages data fetching with TanStack Query
 * - InjectWagmiConnector: Injects the Abstract wallet into Wagmi
 *
 * @param props - Props for the AbstractPrivyProvider component
 * @param props.chain - The blockchain network to connect to (must be supported by Abstract)
 * @param props.transport - Optional transport for network requests (defaults to http)
 * @param props.queryClient - Optional TanStack Query client (defaults to a new QueryClient)
 * @param props.appId - Your Privy app ID (required)
 * @param props.config - Optional Privy configuration (defaults to using Abstract as primary login)
 * @returns A provider component that wraps your application
 *
 * @example
 * ```tsx
 * import { AbstractPrivyProvider } from "@abstract-foundation/agw-react/privy";
 * import { abstract } from "viem/chains";
 *
 * function App() {
 *   return (
 *     <AbstractPrivyProvider
 *       appId="your-privy-app-id"
 *       chain={abstract}
 *     >
 *       <YourApp />
 *     </AbstractPrivyProvider>
 *   );
 * }
 * ```
 *
 * Once your app is wrapped with this provider, you can use all the Abstract and Wagmi hooks
 * throughout your application to interact with blockchain and manage user authentication.
 *
 * @see {@link useAbstractPrivyLogin} - Hook to login users with Abstract Global Wallet via Privy
 * @see {@link useAbstractClient} - Hook to get an Abstract client for blockchain interactions
 */
export const AbstractPrivyProvider = ({
  chain,
  transport,
  queryClient = new QueryClient(),
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
