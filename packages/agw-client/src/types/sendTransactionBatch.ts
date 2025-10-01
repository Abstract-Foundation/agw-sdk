import type { Address, Calls, Hex, Narrow } from 'viem';

export interface SendTransactionBatchParameters<
  calls extends readonly unknown[] = readonly unknown[],
> {
  calls: Calls<Narrow<calls>>;
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
}
