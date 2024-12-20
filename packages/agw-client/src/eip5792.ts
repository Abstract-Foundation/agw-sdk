import type { Address, Hex } from 'viem';

interface Capability {
  supported: boolean;
}

interface ChainCapabilities {
  paymasterService?: Capability;
  sessionKeys?: Capability;
  atomicBatch?: Capability;
}

type WalletCapabilities = Record<`0x${string}`, ChainCapabilities>;

export interface SendCallsParams {
  version: string;
  from: Address;
  calls: {
    to?: Address | undefined;
    data?: Hex | undefined;
    value?: Hex | undefined;
    chainId?: Hex | undefined;
  }[];
  capabilities?: WalletCapabilities | undefined;
}

export const agwCapabilities: WalletCapabilities = {
  '0xab5': {
    atomicBatch: {
      supported: true,
    },
  },
  '0x2b74': {
    atomicBatch: {
      supported: true,
    },
  },
};
