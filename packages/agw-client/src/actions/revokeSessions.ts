import {
  type Account,
  type Client,
  type Hash,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import type { ChainEIP712 } from 'viem/chains';

import SessionKeyValidatorAbi from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { getSessionHash, type SessionConfig } from '../sessions.js';
import { writeContract } from './writeContract.js';

export interface RevokeSessionsParameters {
  session: SessionConfig | Hash | (SessionConfig | Hash)[];
}
export interface RevokeSessionsReturnType {
  transactionHash: Hash | undefined;
}

export async function revokeSessions(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  args: RevokeSessionsParameters,
  isPrivyCrossApp = false,
): Promise<RevokeSessionsReturnType> {
  const { session } = args;

  const sessionHashes =
    typeof session === 'string'
      ? [session as Hash]
      : Array.isArray(session)
        ? session.map(sessionHash)
        : [getSessionHash(session)];

  const transactionHash = await writeContract(
    client,
    signerClient,
    publicClient,
    {
      account: client.account,
      chain: client.chain,
      address: SESSION_KEY_VALIDATOR_ADDRESS,
      abi: SessionKeyValidatorAbi,
      functionName: 'revokeKeys',
      args: [sessionHashes],
    },
    isPrivyCrossApp,
  );

  return { transactionHash };
}

function sessionHash(session: SessionConfig | Hash): Hash {
  if (typeof session === 'string') {
    return session;
  }
  return getSessionHash(session);
}
