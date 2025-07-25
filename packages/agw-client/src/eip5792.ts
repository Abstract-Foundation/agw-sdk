import type { Address, Hex, RpcTransactionReceipt } from 'viem';

enum CallStatus {
  Pending = 100,
  Confirmed = 200,
  OffchainFailure = 400,
  Reverted = 500,
  PartiallyReverted = 600,
}

interface PaymasterServiceCapability {
  url: string;
}

interface AtomicCapabilityV1 {
  supported: boolean;
}

interface AtomicCapabilityV2 {
  status: 'supported' | 'ready' | 'unsupported';
}

interface ChainCapabilitiesV1 {
  paymasterService?: PaymasterServiceCapability;
  atomicBatch?: AtomicCapabilityV1;
}

interface ChainCapabilitiesV2 {
  paymasterService?: PaymasterServiceCapability;
  atomic?: AtomicCapabilityV2;
}

type WalletCapabilitiesV1 = Record<`0x${string}`, ChainCapabilitiesV1>;

type WalletCapabilitiesV2 = Record<`0x${string}`, ChainCapabilitiesV2>;

export type WalletCapabilities = Record<
  `0x${string}`,
  ChainCapabilitiesV1 & ChainCapabilitiesV2
>;

export type SendCallsParams = SendCallsParamsV1 | SendCallsParamsV2;

export interface SendCallsParamsV1 {
  version: '1.0';
  from: Address;
  calls: {
    to?: Address | undefined;
    data?: Hex | undefined;
    value?: Hex | undefined;
    chainId?: Hex | undefined;
  }[];
  capabilities?: WalletCapabilitiesV1 | undefined;
}

export interface SendCallsParamsV2 {
  version: '2.0.0';
  id: string;
  from: Address;
  chainId: Hex;
  atomicRequired: boolean;
  calls: {
    to?: Address | undefined;
    data?: Hex | undefined;
    value?: Hex | undefined;
  }[];
  capabilities: WalletCapabilitiesV2 | undefined;
}

export const agwCapabilitiesV2: WalletCapabilities = {
  '0xab5': {
    atomicBatch: {
      supported: true,
    },
    atomic: {
      status: 'supported',
    },
  },
  '0x2b74': {
    atomicBatch: {
      supported: true,
    },
    atomic: {
      status: 'supported',
    },
  },
};

export function getReceiptStatus(
  receipt: RpcTransactionReceipt | undefined,
): CallStatus {
  switch (receipt?.status) {
    case undefined:
      return CallStatus.Pending;
    case '0x1':
      return CallStatus.Confirmed;
    case '0x0':
      return CallStatus.Reverted;
  }
}
