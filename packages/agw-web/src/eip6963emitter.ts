import {
  type CustomPaymasterHandler,
  transformEIP1193Provider,
} from '@abstract-foundation/agw-client';
import { toPrivyWalletProvider } from '@privy-io/cross-app-connect';
import { type Chain, type EIP1193Provider, http, type Transport } from 'viem';

interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

class EIP6963AnnounceProviderEvent extends CustomEvent<EIP6963ProviderDetail> {
  constructor(detail: EIP6963ProviderDetail) {
    super('eip6963:announceProvider', { detail });
  }
}

const eip6963info: EIP6963ProviderInfo = {
  uuid: '2306fd26-fcfb-4f9e-87da-0d1e237e917c',
  name: 'Abstract Global Wallet',
  icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="161" fill="none"><rect width="160" height="160" y=".953" fill="#00DE73" rx="40"/><rect width="160" height="160" y=".953" fill="url(#a)" fill-opacity=".2" rx="40"/><g filter="url(#b)"><path fill="#F7F9F3" d="m38.095 96.367 24.65-6.602.013-.014 14.252-24.69-6.598-24.663-11.579 3.097 6.599 24.662a8.114 8.114 0 0 1-.817 6.208 8.106 8.106 0 0 1-4.966 3.815L35 84.782l3.095 11.585Z"/><path fill="url(#c)" fill-opacity=".2" d="m38.095 96.367 24.65-6.602.013-.014 14.252-24.69-6.598-24.663-11.579 3.097 6.599 24.662a8.114 8.114 0 0 1-.817 6.208 8.106 8.106 0 0 1-4.966 3.815L35 84.782l3.095 11.585Z"/><path fill="#F7F9F3" d="m97.256 89.765 24.649 6.602L125 84.782l-24.649-6.602a8.107 8.107 0 0 1-4.966-3.815 8.114 8.114 0 0 1-.817-6.208l6.599-24.662-11.579-3.097L82.99 65.06l14.252 24.691.014.014Z"/><path fill="url(#d)" fill-opacity=".2" d="m97.256 89.765 24.649 6.602L125 84.782l-24.649-6.602a8.107 8.107 0 0 1-4.966-3.815 8.114 8.114 0 0 1-.817-6.208l6.599-24.662-11.579-3.097L82.99 65.06l14.252 24.691.014.014Z"/><path fill="#F7F9F3" d="m94.245 94.974 18.051 18.06-8.47 8.474-18.05-18.06a8.09 8.09 0 0 0-5.783-2.393 8.09 8.09 0 0 0-5.782 2.393l-18.051 18.06-8.47-8.474 18.051-18.06h28.504Z"/><path fill="url(#e)" fill-opacity=".2" d="m94.245 94.974 18.051 18.06-8.47 8.474-18.05-18.06a8.09 8.09 0 0 0-5.783-2.393 8.09 8.09 0 0 0-5.782 2.393l-18.051 18.06-8.47-8.474 18.051-18.06h28.504Z"/></g><defs><linearGradient id="a" x1="80" x2="80" y1=".953" y2="88.453" gradientUnits="userSpaceOnUse"><stop stop-color="#80FFC2"/><stop offset="1" stop-color="#80FFC2" stop-opacity="0"/></linearGradient><linearGradient id="c" x1="80" x2="80" y1="40.398" y2="121.508" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1" stop-opacity=".75"/></linearGradient><linearGradient id="d" x1="80" x2="80" y1="40.398" y2="121.508" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1" stop-opacity=".75"/></linearGradient><linearGradient id="e" x1="80" x2="80" y1="40.398" y2="121.508" gradientUnits="userSpaceOnUse"><stop stop-opacity="0"/><stop offset="1" stop-opacity=".75"/></linearGradient><filter id="b" width="106" height="97.11" x="27" y="36.398" color-interpolation-filters="sRGB" filterUnits="userSpaceOnUse"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/><feOffset dy="4"/><feGaussianBlur stdDeviation="4"/><feComposite in2="hardAlpha" operator="out"/><feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"/><feBlend in2="BackgroundImageFix" result="effect1_dropShadow_51_156"/><feBlend in="SourceGraphic" in2="effect1_dropShadow_51_156" result="shape"/></filter></defs></svg>',
  rdns: 'xyz.abs.privy',
};

interface AnnounceProviderParams {
  chain: Chain;
  transport?: Transport;
  customPaymasterHandler?: CustomPaymasterHandler;
}

export function announceProvider({
  chain,
  transport,
  customPaymasterHandler,
}: AnnounceProviderParams) {
  if (typeof window === 'undefined') {
    return;
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

  window.dispatchEvent(
    new EIP6963AnnounceProviderEvent({
      info: eip6963info,
      provider: abstractProvider,
    }),
  );
}
