import { PrivyProvider, type PrivyProviderProps } from '@privy-io/react-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from '@wagmi/core';
import React, { Fragment, useEffect } from 'react';
import { type Transport } from 'viem';
import { abstractTestnet } from 'viem/chains';
import {
  createConfig,
  http,
  useConfig,
  useReconnect,
  WagmiProvider,
} from 'wagmi';

import { usePrivyCrossAppProvider } from './usePrivyCrossAppProvider.js';

interface AgwPrivyProviderProps extends PrivyProviderProps {
  testnet?: boolean;
  transport?: Transport;
}

interface InjectWagmiConnectorProps extends React.PropsWithChildren {
  testnet: boolean;
  transport: Transport;
}

export const InjectWagmiConnector = (props: InjectWagmiConnectorProps) => {
  const { testnet, transport, children } = props;

  const config = useConfig();
  const { reconnect } = useReconnect();
  const { provider, ready } = usePrivyCrossAppProvider({ testnet, transport });

  useEffect(() => {
    const setup = async () => {
      const wagmiConnector = injected({
        target: {
          provider,
          id: 'xyz.abs.privy',
          name: 'Abstract Global Wallet',
          icon: '',
        },
      });

      const connector = config._internal.connectors.setup(wagmiConnector);

      await config.storage?.setItem('recentConnectorId', 'xyz.abs.privy');

      config._internal.connectors.setState([connector]);

      return connector;
    };

    if (ready) {
      setup().then((connector) => {
        if (connector) {
          reconnect({ connectors: [connector] });
        }
      });
    }
  }, [provider, ready]);

  return <Fragment>{children}</Fragment>;
};

export const AgwPrivyProvider = ({
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
