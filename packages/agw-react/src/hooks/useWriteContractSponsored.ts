import type { MutateOptions, MutationOptions } from '@tanstack/query-core';
import { writeContract } from '@wagmi/core';
import type {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  Hex,
  WriteContractErrorType,
} from 'viem';
import {
  type Config,
  type ResolvedRegister,
  useConfig,
  type UseWriteContractParameters,
} from 'wagmi';
import {
  useMutation,
  type UseMutationReturnType,
  type WriteContractData,
  type WriteContractVariables,
} from 'wagmi/query';

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
    WriteContractVariables<
      Abi,
      string,
      readonly unknown[],
      config,
      config['chains'][number]['id']
    > & {
      paymaster: Address;
      paymasterInput: Hex;
    }
  >;
}

export type WriteContractSponsoredMutate<
  config extends Config,
  context = unknown,
> = <
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainId extends config['chains'][number]['id'],
>(
  variables: WriteContractVariables<abi, functionName, args, config, chainId> & {
    paymaster: Address;
    paymasterInput: Hex;
  },
  options?:
    | MutateOptions<
        WriteContractData,
        WriteContractErrorType,
        WriteContractVariables<
          abi,
          functionName,
          args,
          config,
          chainId,
          // use `functionName` to make sure it's not union of all possible function names
          functionName
        > & {
          paymaster: Address;
          paymasterInput: Hex;
        },
        context
      >
    | undefined,
) => void;

export type WriteContractSponsoredMutateAsync<
  config extends Config,
  context = unknown,
> = <
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainId extends config['chains'][number]['id'],
>(
  variables: WriteContractVariables<
    abi,
    functionName,
    args,
    config,
    chainId
  > & {
    paymaster: Address;
    paymasterInput: Hex;
  },
  options?:
    | MutateOptions<
        WriteContractData,
        WriteContractErrorType,
        WriteContractVariables<
          abi,
          functionName,
          args,
          config,
          chainId,
          // use `functionName` to make sure it's not union of all possible function names
          functionName
        > & {
          paymaster: Address;
          paymasterInput: Hex;
        },
        context
      >
    | undefined,
) => Promise<WriteContractData>;

type UseWriteContractSponsoredParameters<
  config extends Config,
  context,
> = UseWriteContractParameters<config, context> & {
  paymaster?: Address;
  paymasterInput?: Hex;
};

export type UseWriteContractSponsoredReturnType<
  config extends Config = Config,
  context = unknown,
> = UseMutationReturnType<
  WriteContractData,
  WriteContractErrorType,
  WriteContractVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config['chains'][number]['id']
  > & {
    paymaster: Address;
    paymasterInput: Hex;
  },
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
