import { type Address, encodeFunctionData, type Hash, type Hex } from 'viem';

import SessionKeyValidatorAbi from './abis/SessionKeyValidator.js';

export enum LimitType {
  Unlimited = 0,
  Lifetime = 1,
  Allowance = 2,
}

/**
 * Limit is the value tracked either for a lifetime or a period on-chain
 * @member limitType - Used to validate limit & period values (unlimited has no limit, lifetime has no period, allowance has both!)
 * @member limit - The limit is exceeded if the tracked value is greater than this over the provided period
 * @member period - The block.timestamp divisor for the limit to be enforced (eg: 60 for a minute, 86400 for a day, 604800 for a week, unset for lifetime)
 */
export interface Limit {
  limitType: LimitType;
  limit: bigint;
  period: bigint;
}

export const LimitUnlimited = {
  limitType: LimitType.Unlimited,
  limit: 0n,
  period: 0n,
};

export const LimitZero = {
  limitType: LimitType.Lifetime,
  limit: 0n,
  period: 0n,
};

/**
 * Common logic operators to used combine multiple constraints
 */
export enum ConstraintCondition {
  Unconstrained = 0,
  Equal = 1,
  Greater = 2,
  Less = 3,
  GreaterEqual = 4,
  LessEqual = 5,
  NotEqual = 6,
}

/**
 * Constraint allows performing logic checks on any binary word (bytes32) in the transaction.
 * This can let you set spend limits against functions on specific contracts
 * @member index - The location of the start of the data in the transaction. This is not the index of the constraint within the containing array!
 * @member condition - The kind of check to perform (None, =, >, <, >=, <=, !=)
 * @member refValue - The value to compare against (as bytes32)
 * @member limit - The limit to enforce on the parsed value (from index)
 */
export interface Constraint {
  index: bigint;
  condition: ConstraintCondition;
  refValue: Hash;
  limit: Limit;
}

/**
 * CallPolicy is a policy for a specific contract (address/function) call.
 * @member target - Only one policy per target per session (unique mapping)
 * @member selector - Solidity function selector (the selector directly), also unique mapping with target
 * @member maxValuePerUse - Will reject transaction if value is set above this amount (for transfer or call)
 * @member valueLimit - If not set, unlimited. If a number or a limit without a period, converts to a lifetime value. Also rejects transactions that have cumulative value greater than what's set here
 * @member constraints - Array of conditions with specific limits for performing range and logic checks (e.g. 5 > x >= 30) on the transaction data (not value!)
 */
export interface CallPolicy {
  target: Address;
  valueLimit: Limit;
  maxValuePerUse: bigint;
  selector: Hash;
  constraints: Constraint[];
}

/**
 * Simplified CallPolicy for transactions with less than 4 bytes of data
 * @member target - Only one policy per target per session (unique mapping from CallPolicies)
 * @member maxValuePerUse - Will reject transaction if value is set above this amount
 * @member valueLimit - Validated from value
 */
export interface TransferPolicy {
  target: Address;
  maxValuePerUse: bigint;
  valueLimit: Limit;
}

/**
 * SessionConfig is a set of policies and metadata to validate a transaction
 * @member signer - The address that signs the transaction (session public key)
 * @member expiresAt - The block.timestamp at which the session is no longer valid
 * @member feeLimit - The maximum fee that can be paid for the transaction (maxFeePerGas * gasLimit)
 * @member callPolicies - Used to validate the transaction data, has complex calldata parsing logic
 * @member transferPolicies - Used to validate the transaction value when there's no additional data
 */
export interface SessionConfig {
  signer: Address;
  expiresAt: bigint;
  feeLimit: Limit;
  callPolicies: CallPolicy[];
  transferPolicies: TransferPolicy[];
}

export enum SessionStatus {
  NotInitialized = 0,
  Active = 1,
  Closed = 2,
}

export interface SessionState {
  status: SessionStatus;
  feesRemaining: bigint;
  transferValue: {
    remaining: bigint;
    target: Address;
    selector: Hash;
    index: bigint;
  }[];
  callValue: {
    remaining: bigint;
    target: Address;
    selector: Hash;
    index: bigint;
  }[];
  callParams: {
    remaining: bigint;
    target: Address;
    selector: Hash;
    index: bigint;
  }[];
}

export function encodeSession(sessionConfig: SessionConfig): Hex {
  const callData = encodeFunctionData({
    abi: SessionKeyValidatorAbi,
    functionName: 'createSession',
    args: [sessionConfig],
  });
  const selector = callData.slice(0, '0x'.length + 8) as Hex; // first 4 bytes for function selector
  const args = `0x${callData.slice(selector.length, callData.length)}` as Hex; // the rest is the arguments
  return args;
}

export function encodeSessionWithPeriodIds(
  sessionConfig: SessionConfig,
  periods: bigint[],
): Hex {
  const callData = encodeFunctionData({
    abi: SessionKeyValidatorAbi,
    functionName: 'createSessionWithPeriods',
    args: [sessionConfig, periods],
  });
  const selector = callData.slice(0, '0x'.length + 8) as Hex; // first 4 bytes for function selector
  const args = `0x${callData.slice(selector.length, callData.length)}` as Hex; // the rest is the arguments
  return args;
}
