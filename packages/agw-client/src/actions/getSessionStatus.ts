import type { Address, Hash, PublicClient, Transport } from 'viem';

import { SessionKeyValidatorAbi } from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import {
  getSessionHash,
  type SessionConfig,
  SessionStatus,
} from '../sessions.js';

/**
 * Gets the current status of a session from the validator contract
 * @param publicClient - The public client to use for the contract call
 * @param address - The account address associated with the session
 * @param sessionHashOrConfig - Either the hash of the session configuration or the session configuration object itself
 * @returns The current status of the session (NotInitialized, Active, Closed, or Expired)
 */
export async function getSessionStatus(
  publicClient: PublicClient<Transport>,
  address: Address,
  sessionHashOrConfig: Hash | SessionConfig,
): Promise<SessionStatus> {
  const sessionHash =
    typeof sessionHashOrConfig === 'string'
      ? sessionHashOrConfig
      : getSessionHash(sessionHashOrConfig);

  return await publicClient.readContract({
    address: SESSION_KEY_VALIDATOR_ADDRESS as Address,
    abi: SessionKeyValidatorAbi,
    functionName: 'sessionStatus',
    args: [address, sessionHash],
  });
}
