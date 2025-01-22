import { createAbstractClient } from '@abstract-foundation/agw-client';
import { useQuery } from '@tanstack/react-query';
import { custom, useChains, useConfig } from 'wagmi';

import { useGlobalWalletSignerClient } from './useGlobalWalletSignerClient.js';

export const useAbstractClient = () => {
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
      });

      return client;
    },
    enabled: status !== 'pending',
  });
};
