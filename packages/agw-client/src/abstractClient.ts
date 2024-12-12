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
import { type ChainEIP712 } from 'viem/zksync';

import type { SessionConfig } from './sessions.js';
import { getSmartAccountAddressFromInitialSigner } from './utils.js';
import {
  type AbstractWalletActions,
  globalWalletActions,
  type SessionClientActions,
  sessionWalletActions,
} from './walletActions.js';

/**
 * Parameters for creating an AbstractClient instance.
 * @interface CreateAbstractClientParameters
 */
interface CreateAbstractClientParameters {
  /**
   * The account used for signing AGW transactions.
   * @type {Account}
   */
  signer: Account;

  /**
   * The chain configuration supporting EIP-712.
   * @type {ChainEIP712}
   */
  chain: ChainEIP712;

  /**
   * Optional transport layer for network communication.
   * If not provided, a default HTTP transport will be used.
   * @type {Transport}
   * @optional
   */
  transport?: Transport;
  address?: Address;
  isPrivyCrossApp?: boolean;
}

interface CreateSessionClientParameters {
  account: Address;
  chain: ChainEIP712;
  signer: Account;
  session: SessionConfig;
  transport?: Transport;
}

type AbstractClientActions = AbstractWalletActions<ChainEIP712, Account>;

export type AbstractClient = Client<Transport, ChainEIP712, Account> &
  AbstractClientActions;

export type SessionClient = Client<Transport, ChainEIP712, Account> &
  SessionClientActions;

export async function createAbstractClient({
  signer,
  chain,
  transport,
  address,
  isPrivyCrossApp = false,
}: CreateAbstractClientParameters): Promise<AbstractClient> {
  if (!transport) {
    transport = http();
  }

  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
  });

  const smartAccountAddress =
    address ??
    (await getSmartAccountAddressFromInitialSigner(
      signer.address,
      publicClient,
    ));

  const baseClient = createClient({
    account: smartAccountAddress,
    chain: chain,
    transport,
  });

  // Create a signer wallet client to handle actual signing
  const signerWalletClient = createWalletClient({
    account: signer,
    chain: chain,
    transport,
  });

  const abstractClient = baseClient.extend(
    globalWalletActions(signerWalletClient, publicClient, isPrivyCrossApp),
  );
  return abstractClient as AbstractClient;
}

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
