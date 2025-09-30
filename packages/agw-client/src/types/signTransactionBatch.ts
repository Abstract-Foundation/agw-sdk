import type { Account, Address, GetChainParameter, Hex } from 'viem';
import type { GetAccountParameter } from 'viem/_types/types/account';
import type { ChainEIP712 } from 'viem/zksync';

export type SignTransactionBatchParameters<
  calls extends readonly unknown[] = readonly unknown[],
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = {
  calls: calls;
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
} & GetAccountParameter<account, Account | Address, true, true> &
  GetChainParameter<chain, chainOverride>;
