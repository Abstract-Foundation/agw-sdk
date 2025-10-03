import type { MutateOptions, MutationOptions } from '@tanstack/query-core';
import type { Compute } from '@wagmi/core/internal';
import { type WriteContractErrorType } from 'viem';
import { type Config } from 'wagmi';
import {
  type CreateSessionParameters,
  type CreateSessionReturnType,
  createSession,
} from '../actions/createSession';

export function createSessionMutationOptions<config extends Config>(
  config: config,
) {
  return {
    mutationFn: async (variables) => {
      return createSession(config, variables);
    },
    mutationKey: ['createSession'],
  } as const satisfies MutationOptions<
    CreateSessionData,
    WriteContractErrorType,
    CreateSessionVariables<config, config['chains'][number]['id']>
  >;
}

export type CreateSessionVariables<
  config extends Config,
  chainId extends config['chains'][number]['id'],
> = CreateSessionParameters<config, chainId>;

export type CreateSessionData = Compute<CreateSessionReturnType>;

export type CreateSessionMutate<config extends Config, context = unknown> = <
  chainId extends config['chains'][number]['id'],
>(
  variables: CreateSessionVariables<config, chainId>,
  options?:
    | MutateOptions<
        CreateSessionData,
        WriteContractErrorType,
        CreateSessionVariables<config, chainId>,
        context
      >
    | undefined,
) => void;

export type CreateSessionMutateAsync<
  config extends Config,
  context = unknown,
> = <chainId extends config['chains'][number]['id']>(
  variables: CreateSessionVariables<config, chainId>,
  options?:
    | MutateOptions<
        CreateSessionData,
        WriteContractErrorType,
        CreateSessionVariables<config, chainId>,
        context
      >
    | undefined,
) => Promise<CreateSessionData>;
