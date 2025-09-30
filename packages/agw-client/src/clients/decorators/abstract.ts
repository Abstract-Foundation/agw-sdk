import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Client,
  type GetChainIdReturnType,
  type Hash,
  type PrepareTransactionRequestReturnType,
  type PublicClient,
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
import { parseAccount } from 'viem/accounts';
import { getChainId } from 'viem/actions';
import {
  type ChainEIP712,
  type Eip712WalletActions,
  type SendEip712TransactionParameters,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
} from 'viem/zksync';
import {
  type CreateSessionParameters,
  type CreateSessionReturnType,
  createSession,
} from '../../actions/createSession.js';
import { deployContract } from '../../actions/deployContract.js';
import { getCallsStatus } from '../../actions/getCallsStatus.js';
import { getCapabilities } from '../../actions/getCapabilities.js';
import {
  type GetLinkedAccountsReturnType,
  getLinkedAccounts,
} from '../../actions/getLinkedAccounts.js';
import {
  type IsLinkedAccountParameters,
  isLinkedAccount,
} from '../../actions/getLinkedAgw.js';
import { getSessionStatus } from '../../actions/getSessionStatus.js';

import {
  type PrepareTransactionRequestParameters,
  type PrepareTransactionRequestRequest,
  prepareTransactionRequest,
} from '../../actions/prepareTransaction.js';
import {
  type RevokeSessionsParameters,
  type RevokeSessionsReturnType,
  revokeSessions,
} from '../../actions/revokeSessions.js';
import { sendCalls } from '../../actions/sendCalls.js';
import { sendTransaction } from '../../actions/sendTransaction.js';
import { sendTransactionBatch } from '../../actions/sendTransactionBatch.js';
import { signMessage } from '../../actions/signMessage.js';
import { signTransaction } from '../../actions/signTransaction.js';
import { signTransactionBatch } from '../../actions/signTransactionBatch.js';
import { signTypedData } from '../../actions/signTypedData.js';
import { writeContract } from '../../actions/writeContract.js';
import { EOA_VALIDATOR_ADDRESS } from '../../constants.js';
import type { SessionConfig, SessionStatus } from '../../sessions.js';
import type { CustomPaymasterHandler } from '../../types/customPaymaster.js';
import type { SendTransactionBatchParameters } from '../../types/sendTransactionBatch.js';
import type { SignTransactionBatchParameters } from '../../types/signTransactionBatch.js';
import { type AbstractClient } from '../abstractClient.js';
import { type SessionClient, toSessionClient } from '../sessionClient.js';

type EIP5792Actions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = Pick<
  WalletActions<chain, account>,
  'getCallsStatus' | 'sendCalls' | 'getCapabilities' | 'showCallsStatus'
>;

export type AbstractWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = EIP5792Actions<chain, account> &
  Eip712WalletActions<chain, account> & {
    getChainId: () => Promise<GetChainIdReturnType>;
    getLinkedAccounts: () => Promise<GetLinkedAccountsReturnType>;
    isLinkedAccount: (args: IsLinkedAccountParameters) => Promise<boolean>;
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
    sendTransactionBatch: <const calls extends readonly unknown[]>(
      args: SendTransactionBatchParameters<calls>,
    ) => Promise<SendTransactionReturnType>;
    signTransactionBatch: <
      const calls extends readonly unknown[],
      chainOverride extends Chain | undefined = undefined,
    >(
      args: SignTransactionBatchParameters<
        calls,
        chain,
        account,
        chainOverride
      >,
    ) => Promise<SignEip712TransactionReturnType>;
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
    getSessionStatus: (
      sessionHashOrConfig: Hash | SessionConfig,
    ) => Promise<SessionStatus>;
  };

export function globalWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  isPrivyCrossApp = false,
  customPaymasterHandler?: CustomPaymasterHandler,
) {
  return (
    client: Client<Transport, ChainEIP712, Account>,
  ): AbstractWalletActions<Chain, Account> => ({
    getChainId: () => getChainId(client),
    getLinkedAccounts: () =>
      getLinkedAccounts(client, {
        agwAddress: parseAccount(client.account).address,
      }),
    isLinkedAccount: (args) => isLinkedAccount(client, args),
    createSession: (args) => createSession(client, publicClient, args),
    revokeSessions: (args) => revokeSessions(client, args),
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
        customPaymasterHandler,
      ),
    sendTransactionBatch: (args) =>
      sendTransactionBatch(
        client,
        signerClient,
        publicClient,
        args,
        isPrivyCrossApp,
        customPaymasterHandler,
      ),
    signMessage: (args: Omit<SignMessageParameters, 'account'>) =>
      signMessage(client, signerClient, args, isPrivyCrossApp),
    signTransaction: (args) =>
      signTransaction(
        client,
        signerClient,
        publicClient,
        args as SignEip712TransactionParameters<chain, account>,
        EOA_VALIDATOR_ADDRESS,
        {},
        customPaymasterHandler,
        isPrivyCrossApp,
      ),
    signTransactionBatch: (args) =>
      signTransactionBatch(
        client,
        signerClient,
        publicClient,
        args as any,
        EOA_VALIDATOR_ADDRESS,
        {},
        customPaymasterHandler,
        isPrivyCrossApp,
      ),
    signTypedData: (
      args: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
    ) =>
      signTypedData(client, signerClient, publicClient, args, isPrivyCrossApp),
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
              customPaymasterHandler,
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
        isPrivyCrossApp,
      ),
    toSessionClient: (signer, session) =>
      toSessionClient({
        client: client as AbstractClient,
        signer,
        session: session,
        paymasterHandler: customPaymasterHandler,
      }),
    getSessionStatus: (sessionHashOrConfig: Hash | SessionConfig) =>
      getSessionStatus(
        publicClient,
        parseAccount(client.account).address,
        sessionHashOrConfig,
      ),
    /** EIP-5792 actions - see https://eips.ethereum.org/EIPS/eip-5792 */
    getCallsStatus: (args) => getCallsStatus(publicClient, args),
    sendCalls: (args) =>
      sendCalls(
        client,
        signerClient,
        publicClient,
        args,
        isPrivyCrossApp,
        customPaymasterHandler,
      ),
    getCapabilities: (args) => getCapabilities(client, args),
    showCallsStatus: (_args) => {
      // requires UI implementation; not implemented in raw client
      return Promise.resolve();
    },
  });
}
