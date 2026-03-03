import {
  type Abi,
  type Account,
  type Chain,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  type Transport,
  type WalletActions,
  type WalletClient,
} from 'viem';
import { parseAccount, type SignTransactionReturnType } from 'viem/accounts';
import {
  type SendTransactionSyncReturnType,
  type WriteContractSyncParameters,
  type WriteContractSyncReturnType,
} from 'viem/actions';

import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SignEip712TransactionParameters,
} from 'viem/zksync';
import { getSessionStatus } from '../../actions/getSessionStatus.js';
import { sendTransactionForSession } from '../../actions/sendTransactionForSession.js';
import { sendTransactionForSessionSync } from '../../actions/sendTransactionForSessionSync.js';
import { signTransactionForSession } from '../../actions/signTransactionForSession.js';
import { signTypedDataForSession } from '../../actions/signTypedData.js';
import { writeContractForSession } from '../../actions/writeContractForSession.js';
import { writeContractForSessionSync } from '../../actions/writeContractForSessionSync.js';
import type { SessionConfig, SessionStatus } from '../../sessions.js';
import type { CustomPaymasterHandler } from '../../types/customPaymaster.js';

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SessionClientActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = undefined,
> = {
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
  signTransaction: (
    args: SignEip712TransactionParameters<chain, account, chainOverride>,
  ) => Promise<SignTransactionReturnType>;
  writeContract: WalletActions<chain, account>['writeContract'];
  sendTransactionSync: <
    const request extends SendTransactionRequest<chain, chainOverride>,
    chainOverride extends ChainEIP712 | undefined = undefined,
  >(
    args: SendEip712TransactionParameters<
      chain,
      account,
      chainOverride,
      request
    > & {
      throwOnReceiptRevert?: boolean;
      timeout?: number;
    },
  ) => Promise<SendTransactionSyncReturnType<ChainEIP712>>;
  writeContractSync: <
    const abi extends Abi | readonly unknown[],
    functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
    args extends ContractFunctionArgs<
      abi,
      'nonpayable' | 'payable',
      functionName
    >,
    chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  >(
    args: WriteContractSyncParameters<
      abi,
      functionName,
      args,
      chain,
      account,
      chainOverride
    >,
  ) => Promise<WriteContractSyncReturnType<ChainEIP712>>;
  signTypedData: WalletActions<chain, account>['signTypedData'];
  getSessionStatus: () => Promise<SessionStatus>;
};

export function sessionWalletActions(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  session: SessionConfig,
  paymasterHandler?: CustomPaymasterHandler,
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
        paymasterHandler,
      ),
    writeContract: (args) =>
      writeContractForSession(
        client,
        signerClient,
        publicClient,
        args,
        session,
        paymasterHandler,
      ),
    sendTransactionSync: (args) =>
      sendTransactionForSessionSync(
        client,
        signerClient,
        publicClient,
        args as any,
        session,
        paymasterHandler,
      ),
    writeContractSync: (args) =>
      writeContractForSessionSync(
        client,
        signerClient,
        publicClient,
        args as any,
        session,
        paymasterHandler,
      ),
    signTransaction: (args) =>
      signTransactionForSession(
        client,
        signerClient,
        publicClient,
        args,
        session,
        paymasterHandler,
      ),
    signTypedData: (args) =>
      signTypedDataForSession(
        client,
        signerClient,
        publicClient,
        args as any,
        session,
        paymasterHandler,
      ),
    getSessionStatus: () =>
      getSessionStatus(
        publicClient,
        parseAccount(client.account).address,
        session,
      ),
  });
}
