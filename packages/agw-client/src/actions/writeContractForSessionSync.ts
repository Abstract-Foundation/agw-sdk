import {
  type Abi,
  type Account,
  BaseError,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  type EncodeFunctionDataParameters,
  encodeFunctionData,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  type WriteContractSyncParameters,
  type WriteContractSyncReturnType,
} from 'viem/actions';
import { getContractError, parseAccount } from 'viem/utils';
import { type ChainEIP712 } from 'viem/zksync';

import { AccountNotFoundError } from '../errors/account.js';
import type { SessionConfig } from '../sessions.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { sendTransactionForSessionSync } from './sendTransactionForSessionSync.js';

export async function writeContractForSessionSync<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: WriteContractSyncParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
  session: SessionConfig,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<WriteContractSyncReturnType<ChainEIP712>> {
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    dataSuffix,
    functionName,
    throwOnReceiptRevert,
    timeout,
    ...request
  } = parameters as WriteContractSyncParameters;

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/contract/writeContract',
    });
  const account = parseAccount(account_);

  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters);

  try {
    return await sendTransactionForSessionSync(
      client,
      signerClient,
      publicClient,
      {
        data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
        to: address,
        account,
        throwOnReceiptRevert,
        timeout,
        ...request,
      },
      session,
      customPaymasterHandler,
    );
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/contract/writeContract',
      functionName,
      sender: account.address,
    });
  }
}
