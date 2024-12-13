import {
  type Account,
  type Address,
  type Client,
  createClient,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Transport,
} from 'viem';
import type { ChainEIP712 } from 'viem/chains';

import type { AbstractClient } from './abstractClient.js';
import type { SessionConfig } from './sessions.js';
import {
  type SessionClientActions,
  sessionWalletActions,
} from './walletActions.js';

interface CreateSessionClientParameters {
  account: Address;
  chain: ChainEIP712;
  signer: Account;
  session: SessionConfig;
  transport?: Transport;
}

export type SessionClient = Client<Transport, ChainEIP712, Account> &
  SessionClientActions;

export interface ToSessionClientParams {
  client: AbstractClient;
  signer: Account;
  session: SessionConfig;
}

export function toSessionClient({
  client,
  signer,
  session,
}: ToSessionClientParams) {
  return createSessionClient({
    account: client.account.address,
    chain: client.chain,
    session,
    signer,
    transport: custom(client.transport),
  });
}

export function createSessionClient({
  account,
  signer,
  chain,
  transport,
  session,
}: CreateSessionClientParameters) {
  if (!transport) {
    transport = http();
  }

  const publicClient = createPublicClient({
    transport: http(),
    chain,
  });

  const baseClient = createClient({
    account,
    chain: chain,
    transport,
  });

  const signerWalletClient = createWalletClient({
    account: signer,
    chain: chain,
    transport,
  });

  const sessionClient = baseClient.extend(
    sessionWalletActions(signerWalletClient, publicClient, session) as any, // why do we need to cast to any here?
  );

  return sessionClient as SessionClient;
}
