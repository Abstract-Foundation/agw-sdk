import {
  type Account,
  type FormattedTransactionRequest,
  type GetChainParameter,
  type Hex,
  maxUint256,
  type UnionOmit,
} from 'viem';
import type { GetAccountParameter } from 'viem/_types/types/account.js';
import type { ChainEIP712 } from 'viem/chains';

import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';

export interface OptimisticTransactionParameters {
  balance: bigint;
  isDeployed: boolean;
  validationHooks: Hex[];
}

export const DefaultOptimisticTransactionParameters: OptimisticTransactionParameters =
  {
    balance: maxUint256,
    isDeployed: true,
    validationHooks: [SESSION_KEY_VALIDATOR_ADDRESS],
  };

export type SignOptimisticEip712TransactionParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
> = UnionOmit<
  FormattedTransactionRequest<
    chainOverride extends ChainEIP712 ? chainOverride : chain
  >,
  'from'
> &
  GetAccountParameter<account> &
  GetChainParameter<chain, chainOverride> & {
    optimistic?: OptimisticTransactionParameters;
  };
