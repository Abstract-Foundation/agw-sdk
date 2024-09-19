import {
  type Abi,
  type Account,
  type Chain,
  type Client,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  type Transport,
  type WalletClient,
  type WriteContractParameters,
} from 'viem';
import {
  type ChainEIP712,
  type Eip712WalletActions,
  type SendEip712TransactionParameters,
  type SignEip712TransactionParameters,
} from 'viem/zksync';

import { deployContract } from './actions/deployTransaction.js';
import {
  sendTransaction,
  sendTransactionBatch,
  type SendTransactionBatchParameters,
} from './actions/sendTransaction.js';
import { signTransaction } from './actions/signTransaction.js';
import { writeContract } from './actions/writeContract.js';
import { VALIDATOR_ADDRESS } from './constants.js';

export type AbstractWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = Eip712WalletActions<chain, account> & {
  sendTransactionBatch: <
    const request extends SendTransactionRequest<ChainEIP712>,
  >(
    args: SendTransactionBatchParameters<request>,
  ) => Promise<SendTransactionReturnType>;
};

export function globalWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
) {
  const validatorAddress = VALIDATOR_ADDRESS;
  return (
    client: Client<Transport, ChainEIP712, Account>,
  ): AbstractWalletActions<Chain, Account> => ({
    sendTransaction: (args) =>
      sendTransaction(
        client,
        signerClient,
        publicClient,
        args as SendEip712TransactionParameters<chain, account>,
        validatorAddress,
      ),
    sendTransactionBatch: (args) =>
      sendTransactionBatch(
        client,
        signerClient,
        publicClient,
        args,
        validatorAddress,
      ),
    signTransaction: (args) =>
      signTransaction(
        client,
        signerClient,
        args as SignEip712TransactionParameters<chain, account>,
        validatorAddress,
      ),
    deployContract: (args) =>
      deployContract(
        client,
        signerClient,
        publicClient,
        args,
        validatorAddress,
      ),
    writeContract: (args) =>
      writeContract(
        Object.assign(client, {
          sendTransaction: (
            args: SendEip712TransactionParameters<chain, account>,
          ) =>
            sendTransaction(
              client,
              signerClient,
              publicClient,
              args,
              validatorAddress,
            ),
        }),
        signerClient,
        publicClient,
        args as WriteContractParameters<
          Abi,
          string,
          readonly unknown[],
          ChainEIP712,
          Account
        >,
        validatorAddress,
      ),
  });
}
