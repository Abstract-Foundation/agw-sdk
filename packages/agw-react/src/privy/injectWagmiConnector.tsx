import { Fragment, useEffect, useState } from 'react';
import React from 'react';
import type { Chain, EIP1193Provider, Transport } from 'viem';
import { useConfig, useReconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

import { usePrivyCrossAppProvider } from './usePrivyCrossAppProvider.js';

interface InjectWagmiConnectorProps extends React.PropsWithChildren {
  /**
   * The chain to connect to.
   * @type {Chain}
   */
  chain: Chain;
  /**
   * Optional transport configuration for the provider.
   * @type {Transport}
   * @optional
   */
  transport?: Transport;
}

/**
 * InjectWagmiConnector is a React component that injects the Abstract Wallet provider into Wagmi's connector system.
 * It handles the setup and reconnection of the wallet provider when ready.
 *
 * @example
 * ```tsx
 * import { InjectWagmiConnector } from '@abstractwallet/agw-react';
 *
 * const App = () => {
 *   return (
 *     <InjectWagmiConnector chain={chain} transport={transport}>
 *       <Component {...pageProps} />
 *     </InjectWagmiConnector>
 *   );
 * };
 * ```
 *
 * @param {InjectWagmiConnectorProps} props - The component props
 * @param {Chain} props.chain - The blockchain network to connect to
 * @param {Transport} [props.transport] - Optional transport configuration for the provider
 * @param {React.ReactNode} props.children - Child components to render
 */

export const InjectWagmiConnector = (props: InjectWagmiConnectorProps) => {
  const { chain, transport, children } = props;

  const config = useConfig();
  const { reconnect } = useReconnect();
  const { provider, ready } = usePrivyCrossAppProvider({ chain, transport });
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    const setup = async (provider: EIP1193Provider) => {
      config.storage?.removeItem('xyz.abs.privy.disconnected');
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

    if (ready && (!isSetup || config.connectors.length === 0)) {
      setup(provider).then((connector) => {
        if (connector) {
          reconnect({ connectors: [connector] });
          setIsSetup(true);
        }
      });
    }
  }, [provider, ready, isSetup, config, reconnect]);

  return <Fragment>{children}</Fragment>;
};
