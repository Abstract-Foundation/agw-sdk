import type { GetChainParameter } from 'viem';
import type { Account, Address, Hex } from 'viem';
import type { GetAccountParameter } from 'viem/_types/types/account';
import type { ChainEIP712, SignEip712TransactionParameters } from 'viem/zksync';

export type SignTransactionBatchParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = {
  calls: SignEip712TransactionParameters<chain, account, chainOverride>[];
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
} & GetAccountParameter<account, Account | Address, true, true> &
  GetChainParameter<chain, chainOverride>;
