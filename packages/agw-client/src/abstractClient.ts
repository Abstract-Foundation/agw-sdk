import {
  type Account,
  type Address,
  type Client,
  createClient,
  createPublicClient,
  createWalletClient,
  http,
  type Transport,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { type ChainEIP712 } from 'viem/zksync';

import { getSmartAccountAddressFromInitialSigner } from './utils.js';
import {
  type AbstractWalletActions,
  globalWalletActions,
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
  publicTransport?: Transport;
}

type AbstractClientActions = AbstractWalletActions<ChainEIP712, Account>;

export type AbstractClient = Client<Transport, ChainEIP712, Account> &
  AbstractClientActions;

export async function createAbstractClient({
  signer,
  chain,
  transport,
  address,
  isPrivyCrossApp = false,
  publicTransport = http(),
}: CreateAbstractClientParameters): Promise<AbstractClient> {
  if (!transport) {
    throw new Error('Transport is required');
  }

  const publicClient = createPublicClient({
    chain: chain,
    transport: publicTransport,
  });

  const smartAccountAddress =
    address ??
    (await getSmartAccountAddressFromInitialSigner(
      signer.address,
      publicClient,
    ));

  const baseClient = createClient({
    account: toAccount(smartAccountAddress),
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
