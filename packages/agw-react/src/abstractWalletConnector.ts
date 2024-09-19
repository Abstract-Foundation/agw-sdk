'use client';
import {
  createAbstractClient,
  getSmartAccountAddressFromInitialSigner,
} from '@abstract-foundation/agw-sdk';
import { toPrivyWalletConnector } from '@privy-io/cross-app-connect';
import type { WalletDetailsParams } from '@rainbow-me/rainbowkit';
import { type CreateConnectorFn } from '@wagmi/core';
import {
  createPublicClient,
  createWalletClient,
  custom,
  type CustomSource,
  type EIP1193EventMap,
  type EIP1193RequestFn,
  type EIP1474Methods,
  http,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { abstractTestnet } from 'viem/chains';

import { AGW_APP_ID, ICON_URL } from './constants.js';

/**
 * Create a wagmi connector for the Abstract Global Wallet.
 *
 * Adapted from wagmi injected connector as a reference implementation:
 * https://github.com/wevm/wagmi/blob/main/packages/core/src/connectors/injected.ts#L94
 *
 * @example
 * import { createConfig, http } from "wagmi";
 * import { abstract } from "wagmi/chains";
 *
 * const privyWalletConnector = toPrivyWalletConnector({
 *   providerAppId: <your-app-id>,
 *   providerName: 'Your app',
 *   providerIconUrl: 'https://example.com/image.png',
 * })
 *
 * export const wagmiConfig = createConfig({
 *   chains: [mainnet],
 *   transports: {
 *     [mainnet.id]: http(),
 *   },
 *   connectors: [abstractWalletConnector],
 *   ssr: true,
 * });
 */
function abstractWalletConnector(
  rkDetails?: WalletDetailsParams,
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
  return (params) => {
    const connector = toPrivyWalletConnector({
      iconUrl: ICON_URL,
      id: AGW_APP_ID,
      name: 'Abstract',
    })(params);

    const getAbstractProvider = async (
      parameters?: { chainId?: number | undefined } | undefined,
    ) => {
      const provider = await connector.getProvider(parameters);
      const providerHandleRequest = provider.request;
      const handler: EIP1193RequestFn<EIP1474Methods> = async (e: any) => {
        const { method, params } = e;
        switch (method) {
          case 'eth_accounts': {
            const accounts = await connector.getAccounts();
            const publicClient = createPublicClient({
              chain: abstractTestnet,
              transport: http(),
            });

            if (accounts?.[0] === undefined) {
              return [];
            }
            const smartAccount = await getSmartAccountAddressFromInitialSigner(
              accounts[0],
              publicClient,
            );
            return [smartAccount];
          }
          case 'eth_signTransaction':
          case 'eth_sendTransaction': {
            const accounts = await connector.getAccounts();

            if (accounts[0] == undefined) {
              throw new Error('Account not found');
            }

            const transport = custom(provider);

            const wallet = createWalletClient({
              account: accounts[0],
              transport,
            });

            const signer = toAccount({
              address: accounts[0],
              signMessage: wallet.signMessage,
              signTransaction:
                wallet.signTransaction as CustomSource['signTransaction'],
              signTypedData:
                wallet.signTypedData as CustomSource['signTypedData'],
            });

            const abstractClient = await createAbstractClient({
              chain: abstractTestnet,
              signer,
              transport,
            });

            if (method === 'eth_signTransaction') {
              console.trace('Signing transaction with abstract client', params);
              return (await abstractClient.signTransaction({
                ...params[0],
              })) as any;
            } else if (method === 'eth_sendTransaction') {
              console.trace('Sending transaction with abstract client', params);
              return (await abstractClient.sendTransaction({
                ...params[0],
              })) as any;
            }
            throw new Error('Should not have reached this point');
          }
          default: {
            return await providerHandleRequest(e);
          }
        }
      };

      return {
        on: provider.on,
        removeListener: provider.removeListener,
        request: handler,
      };
    };

    const abstractConnector = {
      ...connector,
      ...rkDetails,
      getProvider: getAbstractProvider,
      type: 'abstract',
    };
    return abstractConnector;
  };
}

export { abstractWalletConnector };
