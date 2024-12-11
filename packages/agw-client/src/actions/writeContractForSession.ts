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
import { sendTransactionForSession } from './sendTransactionForSession.js';

export interface WriteContractForSessionParameters<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
> {
  parameters: WriteContractParameters<abi, functionName, args, chain, account>;
  session: SessionConfig;
}

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
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: WriteContractForSessionParameters<
    chain,
    account,
    abi,
    functionName,
    args
  >,
  isPrivyCrossApp = false,
): Promise<WriteContractReturnType> {
  const { session, parameters: writeContractParameters } = parameters;
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    dataSuffix,
    functionName,
    ...request
  } = writeContractParameters as WriteContractParameters;

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
        parameters: {
          data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
          to: address,
          account,
          ...request,
        },
        session,
      },
      isPrivyCrossApp,
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
