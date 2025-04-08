import type { Address, Hash, PublicClient, Transport } from 'viem';

import { SessionKeyValidatorAbi } from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import {
  getSessionHash,
  type SessionConfig,
  SessionStatus,
} from '../sessions.js';

/**
 * Function to check the current status of a session key from the validator contract.
 *
 * Allows you to determine if a session is active, expired, closed, or not initialized.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { SessionStatus } from "@abstract-foundation/agw-client/sessions";
 * import { useAccount } from "wagmi";
 *
 * export default function CheckSessionStatus() {
 *   const { address } = useAccount();
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function checkStatus() {
 *     if (!address || !agwClient) return;
 *
 *     // Provide either a session hash or session config object
 *     const sessionHashOrConfig = "..."; // or { ... }
 *     const status = await agwClient.getSessionStatus(sessionHashOrConfig);
 *
 *     // Handle the different status cases
 *     switch (status) {
 *       case 0: // Not initialized
 *         console.log("Session does not exist");
 *       case 1: // Active
 *         console.log("Session is active and can be used");
 *       case 2: // Closed
 *         console.log("Session has been revoked");
 *       case 3: // Expired
 *         console.log("Session has expired");
 *     }
 *   }
 * }
 * ```
 *
 * @param sessionHashOrConfig - Either the hash of the session configuration or the session configuration object itself
 * @returns The current status of the session:
 * - `SessionStatus.NotInitialized` (0): The session has not been created
 * - `SessionStatus.Active` (1): The session is active and can be used
 * - `SessionStatus.Closed` (2): The session has been revoked
 * - `SessionStatus.Expired` (3): The session has expired
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
