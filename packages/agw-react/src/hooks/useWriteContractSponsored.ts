import type { Abi, WriteContractErrorType } from 'viem';
import { type Config, type ResolvedRegister, useConfig } from 'wagmi';
import type { ConfigParameter } from 'wagmi/dist/types/types/properties';
import {
  useMutation,
  type UseMutationParameters,
  type UseMutationReturnType,
  type WriteContractData,
} from 'wagmi/query';

import {
  type WriteContractSponsoredMutate,
  type WriteContractSponsoredMutateAsync,
  writeContractSponsoredMutationOptions,
  type WriteContractSponsoredVariables,
} from '../query/writeContractSponsored.js';

export type UseWriteContractSponsoredParameters<
  config extends Config = Config,
  context = unknown,
> = ConfigParameter<config> & {
  mutation?:
    | UseMutationParameters<
        WriteContractData,
        WriteContractErrorType,
        WriteContractSponsoredVariables<
          Abi,
          string,
          readonly unknown[],
          config,
          config['chains'][number]['id']
        >,
        context
      >
    | undefined;
};

export type UseWriteContractSponsoredReturnType<
  config extends Config = Config,
  context = unknown,
> = UseMutationReturnType<
  WriteContractData,
  WriteContractErrorType,
  WriteContractSponsoredVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config['chains'][number]['id']
  >,
  context
> & {
  writeContractSponsored: WriteContractSponsoredMutate<config, context>;
  writeContractSponsoredAsync: WriteContractSponsoredMutateAsync<
    config,
    context
  >;
};

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
