import {
  AGWAccountAbi,
  sessionKeyValidatorAddress,
} from '@abstract-foundation/agw-client/constants';
import {
  encodeSession,
  type SessionConfig,
  SessionKeyValidatorAbi,
} from '@abstract-foundation/agw-client/sessions';
import type { MutateOptions, MutationOptions } from '@tanstack/query-core';
import { getConnectorClient, readContract, writeContract } from '@wagmi/core';
import type {
  ChainIdParameter,
  Compute,
  ConnectorParameter,
  SelectChains,
  UnionCompute,
} from '@wagmi/core/internal';
import {
  type Account,
  type Address,
  BaseError,
  type Chain,
  type Client,
  concatHex,
  type DeriveChain,
  type FormattedTransactionRequest,
  type GetChainParameter,
  type Hash,
  type Hex,
  type Prettify,
  type UnionEvaluate,
  type UnionOmit,
  type WriteContractErrorType,
} from 'viem';
import type { GetAccountParameter } from 'viem/_types/types/account';
import { type Config } from 'wagmi';

export function createSessionMutationOptions<config extends Config>(
  config: config,
) {
  return {
    mutationFn: async (variables) => {
      const {
        session,
        account: account_,
        chainId,
        connector,
        ...rest
      } = variables;

      let client: Client;
      if (account_ && typeof account_ === 'object' && account_.type === 'local')
        client = config.getClient({ chainId });
      else
        client = await getConnectorClient(config, {
          account: account_ ?? undefined,
          chainId,
          connector,
        });

      const account = client.account;
      if (typeof account === 'undefined')
        throw new BaseError('Account not found');

      const validationHooks = await readContract(config, {
        address: account.address,
        abi: AGWAccountAbi,
        functionName: 'listHooks',
        args: [true],
      });

      const hasSessionModule = validationHooks.some(
        (hook) => hook === sessionKeyValidatorAddress,
      );

      let transactionHash: Hash | undefined = undefined;

      if (!hasSessionModule) {
        const encodedSession = encodeSession(session);
        transactionHash = await writeContract(config, {
          address: account.address,
          abi: AGWAccountAbi,
          functionName: 'addModule',
          args: [concatHex([sessionKeyValidatorAddress, encodedSession])],
          account: account_,
          chainId,
          connector,
          ...rest,
        });
      } else {
        transactionHash = await writeContract(config, {
          address: sessionKeyValidatorAddress,
          abi: SessionKeyValidatorAbi,
          functionName: 'createSession',
          args: [session as never],
          account: account_,
          chainId,
          connector,
          ...rest,
        });
      }

      return {
        transactionHash,
        session,
      };
    },
    mutationKey: ['createSession'],
  } as const satisfies MutationOptions<
    CreateSessionData,
    WriteContractErrorType,
    CreateSessionVariables<config, config['chains'][number]['id']>
  >;
}

type innerCreateSessionVariables<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
  derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
> = GetChainParameter<chain, chainOverride> &
  Prettify<
    GetAccountParameter<account, Account | Address, true, true> & {
      /** Data to append to the end of the calldata. Useful for adding a ["domain" tag](https://opensea.notion.site/opensea/Seaport-Order-Attributions-ec2d69bf455041a5baa490941aad307f). */
      dataSuffix?: Hex | undefined;
    }
  > &
  UnionEvaluate<
    UnionOmit<
      FormattedTransactionRequest<derivedChain>,
      'data' | 'from' | 'to' | 'value'
    >
  > & {
    session: SessionConfig;
    paymaster?: Address;
    paymasterInput?: Hex;
  };

export interface CreateSessionData {
  transactionHash: Hash | undefined;
  session: SessionConfig;
}

export type CreateSessionVariables<
  config extends Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = UnionCompute<
  {
    [key in keyof chains]: innerCreateSessionVariables<
      chains[key],
      Account,
      chains[key]
    >;
  }[number] &
    Compute<ChainIdParameter<config, chainId>> &
    ConnectorParameter
>;

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
