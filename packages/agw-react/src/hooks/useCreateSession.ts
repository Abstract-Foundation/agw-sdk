import { sessionKeyValidatorAddress } from '@abstract-foundation/agw-client/constants';
import {
  type SessionConfig,
  SessionKeyValidatorAbi,
} from '@abstract-foundation/agw-client/sessions';
import type { WriteContractParameters } from '@wagmi/core';
import type { Address, Hex } from 'viem';
import { useWriteContract } from 'wagmi';

export type CreateSessionArgs = {
  session: SessionConfig;
  paymaster?: Address;
  paymasterData?: Hex;
} & Omit<WriteContractParameters, 'address' | 'abi' | 'functionName' | 'args'>;

export const useCreateSession = () => {
  const { writeContract, writeContractAsync, ...writeContractRest } =
    useWriteContract();

  return {
    useCreateSession: (params: CreateSessionArgs) => {
      const { session, ...rest } = params;
      writeContract({
        address: sessionKeyValidatorAddress,
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [session as never],
        ...(rest as any),
      });
    },
    useCreateSessionAsync: async (params: CreateSessionArgs) => {
      const { session, ...rest } = params;
      await writeContractAsync({
        address: sessionKeyValidatorAddress,
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [session as any],
        ...(rest as any),
      });
    },
    ...writeContractRest,
  };
};
