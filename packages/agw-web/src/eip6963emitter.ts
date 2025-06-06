import { transformEIP1193Provider } from '@abstract-foundation/agw-client';
import { toPrivyWalletProvider } from '@privy-io/cross-app-connect';
import { type EIP1193Provider, http } from 'viem';

import abstractIcon from './abstract-icon.js';
import type {
  AnnounceProviderParameters,
  AnnounceProviderReturnType,
  EIP6963ProviderDetail,
  EIP6963ProviderInfo,
} from './types.js';

class EIP6963AnnounceProviderEvent extends CustomEvent<EIP6963ProviderDetail> {
  constructor(detail: EIP6963ProviderDetail) {
    super('eip6963:announceProvider', { detail });
  }
}

const eip6963info: EIP6963ProviderInfo = {
  uuid: '2306fd26-fcfb-4f9e-87da-0d1e237e917c',
  name: 'Abstract Global Wallet',
  icon: abstractIcon,
  rdns: 'xyz.abs.privy',
};

export function announceProvider({
  chain,
  transport,
  customPaymasterHandler,
}: AnnounceProviderParameters): AnnounceProviderReturnType {
  if (typeof window === 'undefined') {
    return () => void 0;
  }

  const privyProvider = toPrivyWalletProvider({
    chainId: chain.id,
    providerAppId: 'cm04asygd041fmry9zmcyn5o5',
    chains: [chain],
    transports: {
      [chain.id]: transport ?? http(),
    },
  }) as EIP1193Provider;

  const abstractProvider = transformEIP1193Provider({
    provider: privyProvider,
    chain,
    transport: transport ?? http(),
    isPrivyCrossApp: true,
    customPaymasterHandler,
  });

  const event = new EIP6963AnnounceProviderEvent({
    info: eip6963info,
    provider: abstractProvider,
  });

  window.dispatchEvent(event);

  const handler = () => window.dispatchEvent(event);
  window.addEventListener('eip6963:requestProvider', handler);
  return () => window.removeEventListener('eip6963:requestProvider', handler);
}
