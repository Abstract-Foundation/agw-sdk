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
import { toAccount } from 'viem/accounts';
import type { ChainEIP712 } from 'viem/chains';

import type { AbstractClient } from './abstractClient.js';
import type { SessionConfig } from './sessions.js';
import type { CustomPaymasterHandler } from './types/customPaymaster.js';
import {
  type SessionClientActions,
  sessionWalletActions,
} from './walletActions.js';

interface CreateSessionClientParameters {
  account: Account | Address;
  chain: ChainEIP712;
  signer: Account;
  session: SessionConfig;
  transport?: Transport;
  paymasterHandler?: CustomPaymasterHandler;
}

export type SessionClient = Client<Transport, ChainEIP712, Account> &
  SessionClientActions;

export interface ToSessionClientParams {
  client: AbstractClient;
  signer: Account;
  session: SessionConfig;
  paymasterHandler?: CustomPaymasterHandler;
}

export function toSessionClient({
  client,
  signer,
  session,
  paymasterHandler,
}: ToSessionClientParams) {
  return createSessionClient({
    account: client.account,
    chain: client.chain,
    session,
    signer,
    transport: custom(client.transport),
    paymasterHandler,
  });
}

export function createSessionClient({
  account,
  signer,
  chain,
  transport,
  session,
  paymasterHandler,
}: CreateSessionClientParameters) {
  if (!transport) {
    transport = http();
  }

  const publicClient = createPublicClient({
    transport,
    chain,
  });

  const baseClient = createClient({
    account: typeof account === 'string' ? toAccount(account) : account,
    chain: chain,
    transport,
  });

  const signerWalletClient = createWalletClient({
    account: signer,
    chain: chain,
    transport,
  });

  const sessionClient = baseClient.extend(
    sessionWalletActions(
      signerWalletClient,
      publicClient,
      session,
      paymasterHandler,
    ),
  );

  return sessionClient as SessionClient;
}
