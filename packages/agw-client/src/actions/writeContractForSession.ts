import {
  type Abi,
  type Account,
  BaseError,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  encodeFunctionData,
  type EncodeFunctionDataParameters,
  type PublicClient,
  type Transport,
  type WalletClient,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem';
import { getContractError, parseAccount } from 'viem/utils';
import { type ChainEIP712 } from 'viem/zksync';

import { AccountNotFoundError } from '../errors/account.js';
import type { SessionConfig } from '../sessions.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { sendTransactionForSession } from './sendTransactionForSession.js';

export async function writeContractForSession<
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
  parameters: WriteContractParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
  session: SessionConfig,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<WriteContractReturnType> {
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    dataSuffix,
    functionName,
    ...request
  } = parameters as WriteContractParameters;

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
    return await sendTransactionForSession(
      client,
      signerClient,
      publicClient,
      {
        data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
        to: address,
        account,
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
