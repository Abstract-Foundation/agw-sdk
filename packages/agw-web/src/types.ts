import type { CustomPaymasterHandler } from '@abstract-foundation/agw-client';
import type { Chain, EIP1193Provider, Transport } from 'viem';

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}

export interface AnnounceProviderParameters {
  chain: Chain;
  transport?: Transport;
  customPaymasterHandler?: CustomPaymasterHandler;
}

export type AnnounceProviderReturnType = () => void;
