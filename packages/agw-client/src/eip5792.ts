import {
  type Address,
  type Capabilities,
  type ExtractCapabilities,
  type Hex,
  type RpcTransactionReceipt,
} from 'viem';

enum CallStatus {
  Pending = 100,
  Confirmed = 200,
  OffchainFailure = 400,
  Reverted = 500,
  PartiallyReverted = 600,
}

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
  capabilities?: Capabilities;
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
  capabilities: Capabilities;
}

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

export const agwCapabilities: ExtractCapabilities<
  'getCapabilities',
  'ReturnType'
> = {
  atomicBatch: {
    supported: true,
  },
  atomic: {
    status: 'supported',
  },
};
