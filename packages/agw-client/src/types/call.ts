import { type Address, type Hex } from 'viem';

export interface Call {
  target: Address;
  allowFailure: boolean;
  value: bigint;
  callData: Hex;
}
