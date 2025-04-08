import {
  createAbstractClient,
  type CustomPaymasterHandler,
} from '@abstract-foundation/agw-client';
import { useQuery } from '@tanstack/react-query';
import { custom, useChains, useConfig } from 'wagmi';

import { useGlobalWalletSignerClient } from './useGlobalWalletSignerClient.js';

export interface UseAbstractClientOptions {
  customPaymasterHandler: CustomPaymasterHandler;
}

/**
 * React hook that provides access to the Abstract Global Wallet client
 * used by the `AbstractWalletProvider` component.
 *
 * Use this client to perform operations such as sending transactions, deploying contracts,
 * and interacting with smart contracts from the connected Abstract Global Wallet.
 *
 * @param options - Optional client configuration
 * @param options.customPaymasterHandler - Optional paymaster handler for custom gas sponsorship logic
 * @returns Query result containing the Abstract client when successfully created
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * function SendTransactionComponent() {
 *   const { data: client, isLoading } = useAbstractClient();
 *
 *   const handleSendTransaction = async () => {
 *     if (!client) return;
 *
 *     const hash = await client.sendTransaction({
 *       to: '0x8e729E23CDc8bC21c37a73DA4bA9ebdddA3C8B6d',
 *       data: '0x69',
 *     });
 *     console.log('Transaction sent:', hash);
 *   };
 *
 *   return (
 *     <button onClick={handleSendTransaction} disabled={isLoading || !client}>
 *       Send Transaction
 *     </button>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useAbstractClient](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useAbstractClient)
 *
 * @see {@link createAbstractClient} - The underlying client creation function
 */
export const useAbstractClient = ({
  customPaymasterHandler,
}: Partial<UseAbstractClientOptions> = {}) => {
  const { data: signer, status, error } = useGlobalWalletSignerClient();
  const [chain] = useChains();
  const config = useConfig();

  return useQuery({
    gcTime: 0,
    queryKey: ['abstractClient'],
    queryFn: async () => {
      if (error) {
        throw error;
      }
      if (!signer) {
        throw new Error('No signer found');
      }

      const client = createAbstractClient({
        signer: signer.account,
        chain,
        transport: custom(signer.transport),
        isPrivyCrossApp: true,
        publicTransport: config?._internal.transports[chain.id],
        customPaymasterHandler,
      });

      return client;
    },
    enabled: status !== 'pending',
  });
};
