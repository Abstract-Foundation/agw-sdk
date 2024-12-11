import {
  type Account,
  type Client,
  concatHex,
  type GetChainParameter,
  type Hash,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { readContract } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import SessionKeyValidatorAbi from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { encodeSession, type SessionConfig } from '../sessions.js';
import type { GetAccountParameter } from './prepareTransaction.js';
import { writeContract } from './writeContract.js';

export interface CreateSessionParameters<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
> {
  session: SessionConfig;
  parameters?: GetChainParameter<chain, chainOverride> &
    GetAccountParameter<account, undefined, true>;
}

export interface CreateSessionReturnType {
  transactionHash: Hash | undefined;
  session: SessionConfig;
}

export async function createSession<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  args: CreateSessionParameters<chain, account, chainOverride>,
  isPrivyCrossApp = false,
): Promise<CreateSessionReturnType> {
  const {
    session,
    // parameters
  } = args;

  const validationHooks = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: client.account.address,
    abi: AGWAccountAbi,
    functionName: 'listHooks',
    args: [true],
  });

  const hasSessionModule = validationHooks.some(
    (hook) => hook === SESSION_KEY_VALIDATOR_ADDRESS,
  );

  let transactionHash: Hash | undefined = undefined;

  if (!hasSessionModule) {
    const encodedSession = encodeSession(session);
    transactionHash = await writeContract(
      client,
      signerClient,
      publicClient,
      {
        account: client.account,
        chain: client.chain,
        address: client.account.address,
        abi: AGWAccountAbi,
        functionName: 'addModule',
        args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodedSession])],
      },
      isPrivyCrossApp,
    );
  } else {
    transactionHash = await writeContract(
      client,
      signerClient,
      publicClient,
      {
        //...parameters,
        account: client.account,
        chain: client.chain,
        address: SESSION_KEY_VALIDATOR_ADDRESS,
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [session as any],
      },
      isPrivyCrossApp,
    );
  }

  return { transactionHash, session };
}
