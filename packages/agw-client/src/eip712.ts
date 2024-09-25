import { type ExactPartial, type OneOf } from 'viem';
import { assertRequest } from 'viem/utils';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type ZksyncTransactionRequest,
  type ZksyncTransactionSerializable,
} from 'viem/zksync';

import { InvalidEip712TransactionError } from './errors/eip712.js';

export type AssertEip712RequestParameters = ExactPartial<
  SendEip712TransactionParameters<ChainEIP712>
>;

export function isEIP712Transaction(
  transaction: ExactPartial<
    OneOf<ZksyncTransactionRequest | ZksyncTransactionSerializable>
  >,
) {
  if (transaction.type === 'eip712') return true;
  if (
    ('customSignature' in transaction && transaction.customSignature) ||
    ('paymaster' in transaction && transaction.paymaster) ||
    ('paymasterInput' in transaction && transaction.paymasterInput) ||
    ('gasPerPubdata' in transaction &&
      typeof transaction.gasPerPubdata === 'bigint') ||
    ('factoryDeps' in transaction && transaction.factoryDeps)
  )
    return true;
  return false;
}

export function assertEip712Request(args: AssertEip712RequestParameters) {
  if (!isEIP712Transaction(args as any))
    throw new InvalidEip712TransactionError();
  assertRequest(args as any);
}
