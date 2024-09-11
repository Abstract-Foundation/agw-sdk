import {
  type Account,
  type Client,
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  type Transport,
} from 'viem';
import { type ChainEIP712 } from 'viem/zksync';

import { type AbstractWalletActions, globalWalletActions } from './actions.js';
import { getSmartAccountAddressFromInitialSigner } from './utils.js';

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
}

type AbstractClientActions = AbstractWalletActions<ChainEIP712, Account>;

export type AbstractClient = Client<Transport, ChainEIP712, Account> &
  AbstractClientActions;

export async function createAbstractClient({
  signer,
  transport,
  chain,
}: CreateAbstractClientParameters): Promise<AbstractClient> {
  if (!transport) {
    transport = http();
  }

  const publicClient = createPublicClient({
    chain: chain,
    transport,
  });

  const smartAccountAddress = await getSmartAccountAddressFromInitialSigner(
    signer.address,
    publicClient,
  );

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
    globalWalletActions(signerWalletClient, publicClient),
  );
  return abstractClient as AbstractClient;
}
