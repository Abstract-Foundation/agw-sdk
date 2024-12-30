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
