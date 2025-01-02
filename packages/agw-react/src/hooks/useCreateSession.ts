import { type SessionConfig } from '@abstract-foundation/agw-client/sessions';
import { useMutation } from '@tanstack/react-query';
import type {
  Config,
  ResolvedRegister,
  WriteContractErrorType,
  WriteContractParameters,
} from '@wagmi/core';
import { type Address, type Hex } from 'viem';
import { useConfig } from 'wagmi';
import type { ConfigParameter } from 'wagmi/dist/types/types/properties.js';
import type { UseMutationParameters, UseMutationReturnType } from 'wagmi/query';

import {
  type CreateSessionData,
  type CreateSessionMutate,
  type CreateSessionMutateAsync,
  createSessionMutationOptions,
  type CreateSessionVariables,
} from '../query/createSession.js';

export type CreateSessionArgs = {
  session: SessionConfig;
  paymaster?: Address;
  paymasterData?: Hex;
} & Omit<WriteContractParameters, 'address' | 'abi' | 'functionName' | 'args'>;

export type UseCreateSessionParameters<
  config extends Config = Config,
  context = unknown,
> = ConfigParameter<config> & {
  mutation?:
    | UseMutationParameters<
        CreateSessionData,
        WriteContractErrorType,
        CreateSessionVariables<config, config['chains'][number]['id']>,
        context
      >
    | undefined;
};

export type UseCreateSessionReturnType<
  config extends Config = Config,
  context = unknown,
> = UseMutationReturnType<
  CreateSessionData,
  WriteContractErrorType,
  CreateSessionVariables<config, config['chains'][number]['id']>,
  context
> & {
  createSession: CreateSessionMutate<config, context>;
  createSessionAsync: CreateSessionMutateAsync<config, context>;
};

export function useCreateSession<
  config extends Config = ResolvedRegister['config'],
  context = unknown,
>(
  parameters: UseCreateSessionParameters<config, context> = {},
): UseCreateSessionReturnType<config, context> {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = createSessionMutationOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  type Return = UseCreateSessionReturnType<config, context>;
  return {
    ...result,
    createSession: mutate as Return['createSession'],
    createSessionAsync: mutateAsync as Return['createSessionAsync'],
  };
}
