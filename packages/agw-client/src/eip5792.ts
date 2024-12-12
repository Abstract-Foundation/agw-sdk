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

interface SendCallData {
  to: Address;
  value: Hex;
  data: Hex;
  chainId: Hex;
}

export interface SendCallsParameters {
  version: '1.0';
  from: Address;
  calls: SendCallData[];
}

export const agwCapablities: WalletCapabilities = {
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
