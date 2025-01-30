import { type Address, type Hex } from 'viem';

export interface CustomPaymasterParameters {
  from: Address;
  chainId: number;
  nonce?: number | undefined;
  to?: Address | undefined;
  gas?: bigint | undefined;
  gasPrice?: bigint | undefined;
  gasPerPubdata?: bigint | undefined;
  value?: bigint | undefined;
  data?: Hex | undefined;
  maxFeePerGas?: bigint | undefined;
  maxPriorityFeePerGas?: bigint | undefined;
}

export interface PaymasterArgs {
  paymaster: Address;
  paymasterInput: Hex;
}

export type CustomPaymasterHandler = (
  args: CustomPaymasterParameters,
) => Promise<PaymasterArgs>;
