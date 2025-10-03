import {
  type CreateSessionParameters as client_CreateSessionParameters,
  createSession as client_createSession,
} from '@abstract-foundation/agw-client/actions';
import type { SessionConfig } from '@abstract-foundation/agw-client/sessions';
import { getConnectorClient, type SelectChains } from '@wagmi/core';
import type { Compute } from '@wagmi/core/dist/types/types/utils';
import type {
  ChainIdParameter,
  ConnectorParameter,
} from '@wagmi/core/internal';
import type { Account, Client, Hash } from 'viem';
import { getAction } from 'viem/utils';
import type { Config } from 'wagmi';
import type { Chain } from 'wagmi/chains';

export type CreateSessionParameters<
  config extends Config = Config,
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  ///
  chains extends readonly Chain[] = SelectChains<config, chainId>,
> = {
  [key in keyof chains]: Compute<
    Omit<
      client_CreateSessionParameters<chains[key], Account, chains[key]>,
      'chain'
    > &
      ChainIdParameter<config, chainId> &
      ConnectorParameter
  >;
}[number];

export interface CreateSessionReturnType {
  transactionHash: Hash | undefined;
  session: SessionConfig;
}

export async function createSession<
  config extends Config,
  chainId extends config['chains'][number]['id'],
>(
  config: config,
  parameters: CreateSessionParameters<config, chainId>,
): Promise<CreateSessionReturnType> {
  const { account, chainId, connector, ...rest } = parameters;

  let client: Client;
  if (typeof account === 'object' && account?.type === 'local')
    client = config.getClient({ chainId });
  else
    client = await getConnectorClient(config, {
      account: account ?? undefined,
      chainId,
      connector,
    });

  const action = getAction(client, client_createSession, 'createSession');
  const result = await action({
    ...(rest as any),
    ...(account ? { account } : {}),
    chain: chainId ? { id: chainId } : null,
  });

  return result as CreateSessionReturnType;
}
