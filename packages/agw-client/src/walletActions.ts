import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Client,
  type PrepareTransactionRequestReturnType,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  type SignMessageParameters,
  type SignMessageReturnType,
  type SignTypedDataParameters,
  type SignTypedDataReturnType,
  type Transport,
  type WalletActions,
  type WalletClient,
  type WriteContractParameters,
} from 'viem';
import {
  type ChainEIP712,
  type Eip712WalletActions,
  type SendEip712TransactionParameters,
  type SignEip712TransactionParameters,
} from 'viem/zksync';

import { type AbstractClient } from './abstractClient.js';
import {
  createSession,
  type CreateSessionParameters,
  type CreateSessionReturnType,
} from './actions/createSession.js';
import { deployContract } from './actions/deployContract.js';
import {
  prepareTransactionRequest,
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestRequest,
} from './actions/prepareTransaction.js';
import {
  revokeSessions,
  type RevokeSessionsParameters,
  type RevokeSessionsReturnType,
} from './actions/revokeSessions.js';
import {
  sendTransaction,
  sendTransactionBatch,
} from './actions/sendTransaction.js';
import { sendTransactionForSession } from './actions/sendTransactionForSession.js';
import { signMessage } from './actions/signMessage.js';
import { signTransaction } from './actions/signTransaction.js';
import { signTypedData } from './actions/signTypedData.js';
import { writeContract } from './actions/writeContract.js';
import { writeContractForSession } from './actions/writeContractForSession.js';
import { EOA_VALIDATOR_ADDRESS } from './constants.js';
import { type SessionClient, toSessionClient } from './sessionClient.js';
import type { SessionConfig } from './sessions.js';
import type { SendTransactionBatchParameters } from './types/sendTransactionBatch.js';

export type AbstractWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = Eip712WalletActions<chain, account> & {
  createSession: (
    args: CreateSessionParameters,
  ) => Promise<CreateSessionReturnType>;
  revokeSessions: (
    args: RevokeSessionsParameters,
  ) => Promise<RevokeSessionsReturnType>;
  signMessage: (
    args: Omit<SignMessageParameters, 'account'>,
  ) => Promise<SignMessageReturnType>;
  signTypedData: (
    args: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
  ) => Promise<SignTypedDataReturnType>;
  sendTransactionBatch: <
    const request extends SendTransactionRequest<ChainEIP712>,
  >(
    args: SendTransactionBatchParameters<request>,
  ) => Promise<SendTransactionReturnType>;
  prepareAbstractTransactionRequest: <
    chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    account extends Account | undefined = Account | undefined,
    accountOverride extends Account | Address | undefined = undefined,
    chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
    const request extends PrepareTransactionRequestRequest<
      chain,
      chainOverride
    > = PrepareTransactionRequestRequest<chain, chainOverride>,
  >(
    args: PrepareTransactionRequestParameters<
      chain,
      account,
      chainOverride,
      accountOverride,
      request
    >,
  ) => Promise<PrepareTransactionRequestReturnType>;
  toSessionClient: (signer: Account, session: SessionConfig) => SessionClient;
};

export interface SessionClientActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> {
  sendTransaction: <
    const request extends SendTransactionRequest<chain, chainOverride>,
    chainOverride extends ChainEIP712 | undefined = undefined,
  >(
    args: SendEip712TransactionParameters<
      chain,
      account,
      chainOverride,
      request
    >,
  ) => Promise<SendTransactionReturnType>;
  writeContract: WalletActions<chain, account>['writeContract'];
}

export function sessionWalletActions(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  session: SessionConfig,
) {
  return (
    client: Client<Transport, ChainEIP712, Account>,
  ): SessionClientActions<Chain, Account> => ({
    sendTransaction: (args) =>
      sendTransactionForSession(
        client,
        signerClient,
        publicClient,
        args,
        session,
      ),
    writeContract: (args) =>
      writeContractForSession(
        client,
        signerClient,
        publicClient,
        args,
        session,
      ),
  });
}

export function globalWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  isPrivyCrossApp = false,
) {
  return (
    client: Client<Transport, ChainEIP712, Account>,
  ): AbstractWalletActions<Chain, Account> => ({
    createSession: (args) =>
      createSession(client, signerClient, publicClient, args, isPrivyCrossApp),
    revokeSessions: (args) =>
      revokeSessions(client, signerClient, publicClient, args, isPrivyCrossApp),
    prepareAbstractTransactionRequest: (args) =>
      prepareTransactionRequest(
        client,
        signerClient,
        publicClient,
        args as any,
      ),
    sendTransaction: (args) =>
      sendTransaction(
        client,
        signerClient,
        publicClient,
        args as any,
        isPrivyCrossApp,
      ),
    sendTransactionBatch: (args) =>
      sendTransactionBatch(
        client,
        signerClient,
        publicClient,
        args,
        isPrivyCrossApp,
      ),
    signMessage: (args: Omit<SignMessageParameters, 'account'>) =>
      signMessage(client, signerClient, args, isPrivyCrossApp),
    signTransaction: (args) =>
      signTransaction(
        client,
        signerClient,
        args as SignEip712TransactionParameters<chain, account>,
        EOA_VALIDATOR_ADDRESS,
      ),
    signTypedData: (
      args: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
    ) => signTypedData(client, signerClient, args, isPrivyCrossApp),
    deployContract: (args) =>
      deployContract(client, signerClient, publicClient, args, isPrivyCrossApp),
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
              isPrivyCrossApp,
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
      ),
    toSessionClient: (signer, session) =>
      toSessionClient({
        client: client as AbstractClient,
        signer,
        session: session,
      }),
  });
}
