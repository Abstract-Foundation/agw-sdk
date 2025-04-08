import { sessionKeyValidatorAddress } from '@abstract-foundation/agw-client/constants';
import {
  getSessionHash,
  type SessionConfig,
  SessionKeyValidatorAbi,
} from '@abstract-foundation/agw-client/sessions';
import type { WriteContractParameters } from '@wagmi/core';
import type { Address, Hash, Hex } from 'viem';
import { useWriteContract } from 'wagmi';

export type RevokeSessionsArgs = {
  sessions: SessionConfig | Hash | (SessionConfig | Hash)[];
  paymaster?: Address;
  paymasterData?: Hex;
} & Omit<WriteContractParameters, 'address' | 'abi' | 'functionName' | 'args'>;

/**
 * React hook for revoking session keys from an Abstract Global Wallet.
 *
 * Use this hook to revoke session keys, preventing them from being able to execute
 * any further transactions on behalf of the wallet.
 *
 * Under the hood, it uses wagmi's `useWriteContract` hook to call the `revokeKeys`
 * function on the SessionKeyValidator contract.
 *
 * @returns An object containing functions and state for revoking sessions:
 * - `revokeSessions`: Function to revoke session keys
 * - `revokeSessionsAsync`: Promise-based function to revoke session keys
 * - `isPending`: Boolean indicating if a revocation is in progress
 * - `isError`: Boolean indicating if the revocation resulted in an error
 * - `error`: Error object if the revocation failed
 * - Other standard wagmi useWriteContract properties
 *
 * @example
 * ```tsx
 * import { useRevokeSessions } from "@abstract-foundation/agw-react";
 * import { getSessionHash } from "@abstract-foundation/agw-client/sessions";
 * import type { SessionConfig } from "@abstract-foundation/agw-client/sessions";
 *
 * export default function RevokeSessionExample() {
 *   const {
 *     revokeSessionsAsync,
 *     revokeSessions,
 *     isPending,
 *     isError,
 *     error
 *   } = useRevokeSessions();
 *
 *   // A session configuration stored in your application
 *   const mySessionConfig: SessionConfig = {
 *     // Your session configuration
 *   };
 *
 *   async function handleRevokeSession() {
 *     try {
 *       // Revoke a single session using its configuration
 *       await revokeSessionsAsync({
 *         sessions: mySessionConfig,
 *       });
 *
 *       // Or revoke a session using its hash
 *       await revokeSessionsAsync({
 *         sessions: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
 *       });
 *
 *       // Or revoke multiple sessions at once
 *       await revokeSessionsAsync({
 *         sessions: [
 *           mySessionConfig,
 *           "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
 *           anotherSessionConfig
 *         ],
 *       });
 *
 *       console.log("Sessions revoked successfully");
 *     } catch (err) {
 *       console.error("Failed to revoke sessions:", err);
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={handleRevokeSession}
 *         disabled={isPending}
 *       >
 *         {isPending ? "Revoking..." : "Revoke Sessions"}
 *       </button>
 *
 *       {isError && (
 *         <div className="error">
 *           Error: {error?.message}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useRevokeSessions](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useRevokeSessions)
 *
 * @see {@link useWriteContract} - The underlying wagmi hook
 * @see {@link SessionKeyValidatorAbi} - The ABI for the session validator contract
 * @see {@link getSessionHash} - Function to compute the hash of a session configuration
 */
export const useRevokeSessions = () => {
  const { writeContract, writeContractAsync, ...writeContractRest } =
    useWriteContract();
  const getSessionHashes = (
    sessions: SessionConfig | Hash | (SessionConfig | Hash)[],
  ): Hash[] => {
    return typeof sessions === 'string'
      ? [sessions as Hash]
      : Array.isArray(sessions)
        ? sessions.map((session) =>
            typeof session === 'string' ? session : getSessionHash(session),
          )
        : [getSessionHash(sessions)];
  };

  return {
    revokeSessions: (params: RevokeSessionsArgs) => {
      const { sessions, ...rest } = params;
      const sessionHashes = getSessionHashes(sessions);
      writeContract({
        address: sessionKeyValidatorAddress,
        abi: SessionKeyValidatorAbi,
        functionName: 'revokeKeys',
        args: [sessionHashes],
        ...(rest as any),
      });
    },
    revokeSessionsAsync: async (params: RevokeSessionsArgs) => {
      const { sessions, ...rest } = params;
      const sessionHashes = getSessionHashes(sessions);
      await writeContractAsync({
        address: sessionKeyValidatorAddress,
        abi: SessionKeyValidatorAbi,
        functionName: 'revokeKeys',
        args: [sessionHashes],
        ...(rest as any),
      });
    },
    ...writeContractRest,
  };
};
