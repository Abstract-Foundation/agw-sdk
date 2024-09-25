import type { MutationOptions } from '@tanstack/query-core';
import { writeContract } from '@wagmi/core';
import type { Abi, WriteContractErrorType } from 'viem';
import { type Config, type ResolvedRegister, useConfig } from 'wagmi';
import { useMutation, type WriteContractData } from 'wagmi/query';

import type {
  UseWriteContractSponsoredParameters,
  UseWriteContractSponsoredReturnType,
  WriteContractSponsoredVariables,
} from '../actions/writeContractSponsored.js';

export function writeContractSponsoredMutationOptions<config extends Config>(
  config: config,
) {
  return {
    mutationFn(variables) {
      return writeContract(config, variables);
    },
    mutationKey: ['writeContract'],
  } as const satisfies MutationOptions<
    WriteContractData,
    WriteContractErrorType,
    WriteContractSponsoredVariables<
      Abi,
      string,
      readonly unknown[],
      config,
      config['chains'][number]['id']
    >
  >;
}

export function useWriteContractSponsored<
  config extends Config = ResolvedRegister['config'],
  context = unknown,
>(
  parameters: UseWriteContractSponsoredParameters<config, context> = {},
): UseWriteContractSponsoredReturnType<config, context> {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = writeContractSponsoredMutationOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  type Return = UseWriteContractSponsoredReturnType<config, context>;
  return {
    ...result,
    writeContractSponsored: mutate as Return['writeContractSponsored'],
    writeContractSponsoredAsync:
      mutateAsync as Return['writeContractSponsoredAsync'],
  };
}
