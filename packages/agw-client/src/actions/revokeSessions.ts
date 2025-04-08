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

/**
 * Function to revoke session keys from the connected Abstract Global Wallet.
 *
 * This allows you to invalidate existing session keys, preventing them from being used for future transactions.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * export default function RevokeSessions() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function revokeSessions() {
 *     if (!agwClient) return;
 *
 *     // Revoke a single session by passing the session configuration
 *     const { transactionHash } = await agwClient.revokeSessions({
 *       session: existingSession,
 *     });
 *
 *     // Or - revoke multiple sessions at once
 *     const { transactionHash } = await agwClient.revokeSessions({
 *       session: [existingSession1, existingSession2],
 *     });
 *
 *     // Or - revoke sessions using their creation transaction hashes
 *     const { transactionHash } = await agwClient.revokeSessions({
 *       session: "0x1234...",
 *     });
 *
 *     // Or - revoke multiple sessions using their creation transaction hashes
 *     const { transactionHash } = await agwClient.revokeSessions({
 *       session: ["0x1234...", "0x5678..."],
 *     });
 *
 *     // Or - revoke multiple sessions using both session configuration and creation transaction hashes
 *     const { transactionHash } = await agwClient.revokeSessions({
 *       session: [existingSession, "0x1234..."],
 *     });
 *   }
 * }
 * ```
 *
 * @param parameters - Parameters for revoking sessions
 * @param parameters.session - The session(s) to revoke (required). Can be provided in three formats:
 *                           - A single SessionConfig object
 *                           - A single session key creation transaction hash from createSession
 *                           - An array of SessionConfig objects and/or session key creation transaction hashes
 * @param parameters.paymaster - Optional paymaster address to sponsor the transaction
 * @param parameters.paymasterInput - Optional paymaster input data
 * @returns Object containing the transaction hash of the revocation transaction
 */
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
