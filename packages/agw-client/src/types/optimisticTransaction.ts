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

/**
 * Parameters for configuring an optimistic transaction (experimental)
 * @property {bigint} balance - The current balance of the wallet used for the transaction
 * @property {boolean} isDeployed - Deployment status of the account
 * @property {Hex[]} validationHooks - Array of validation hooks installed in the wallet
 */
export interface OptimisticTransactionParameters {
  /** The current balance of the wallet used for the transaction */
  balance: bigint;
  /** Deployment status of the account */
  isDeployed: boolean;
  /** Array of validation hooks installed in the wallet */
  validationHooks: Hex[];
}

/**
 *  Default parameters for an optimistic transaction.
 *  - balance: uint256 max
 *  - isDeployed: true
 *  - validationHooks: array with single item of session key validator
 */
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
    /** @experimental This parameter is experimental and subject to change */
    optimistic?: OptimisticTransactionParameters;
  };
