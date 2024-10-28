import type {
  Account,
  Address,
  Chain,
  Hex,
  SendTransactionRequest,
} from 'viem';
import type { SendEip712TransactionParameters } from 'viem/zksync';

export interface SendTransactionBatchParameters<
  request extends SendTransactionRequest<Chain> = SendTransactionRequest<Chain>,
> {
  // TODO: figure out if more fields need to be lifted up
  calls: SendEip712TransactionParameters<Chain, Account, Chain, request>[];
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
}
