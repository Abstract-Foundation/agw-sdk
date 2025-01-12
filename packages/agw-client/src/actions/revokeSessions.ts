import {
  type Account,
  type Address,
  type Client,
  type Hash,
  type Hex,
  type Transport,
} from 'viem';
import { writeContract } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import { SessionKeyValidatorAbi } from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { getSessionHash, type SessionConfig } from '../sessions.js';

export interface RevokeSessionsParameters {
  session: SessionConfig | Hash | (SessionConfig | Hash)[];
  paymaster?: Address;
  paymasterInput?: Hex;
}
export interface RevokeSessionsReturnType {
  transactionHash: Hash | undefined;
}

export async function revokeSessions(
  client: Client<Transport, ChainEIP712, Account>,
  args: RevokeSessionsParameters,
): Promise<RevokeSessionsReturnType> {
  const { session, ...rest } = args;

  const sessionHashes =
    typeof session === 'string'
      ? [session as Hash]
      : Array.isArray(session)
        ? session.map(sessionHash)
        : [getSessionHash(session)];

  const transactionHash = await getAction(
    client,
    writeContract,
    'writeContract',
  )({
    address: SESSION_KEY_VALIDATOR_ADDRESS,
    abi: SessionKeyValidatorAbi,
    functionName: 'revokeKeys',
    args: [sessionHashes],
    ...rest,
  } as any);

  return { transactionHash };
}

function sessionHash(session: SessionConfig | Hash): Hash {
  if (typeof session === 'string') {
    return session;
  }
  return getSessionHash(session);
}
