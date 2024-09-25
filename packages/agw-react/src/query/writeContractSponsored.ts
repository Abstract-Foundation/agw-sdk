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
import { type Config } from 'wagmi';
import {
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
    WriteContractSponsoredVariables<
      Abi,
      string,
      readonly unknown[],
      config,
      config['chains'][number]['id']
    >
  >;
}

export type WriteContractSponsoredVariables<
  abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  config extends Config,
  chainId extends config['chains'][number]['id'],
  ///
  allFunctionNames = ContractFunctionName<abi, 'nonpayable' | 'payable'>,
> = WriteContractVariables<
  abi,
  functionName,
  args,
  config,
  chainId,
  allFunctionNames
> & {
  paymaster: Address;
  paymasterInput: Hex;
};

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
  variables: WriteContractSponsoredVariables<
    abi,
    functionName,
    args,
    config,
    chainId
  >,
  options?:
    | MutateOptions<
        WriteContractData,
        WriteContractErrorType,
        WriteContractSponsoredVariables<
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
  variables: WriteContractSponsoredVariables<
    abi,
    functionName,
    args,
    config,
    chainId
  >,
  options?:
    | MutateOptions<
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
    | undefined,
) => Promise<WriteContractData>;
