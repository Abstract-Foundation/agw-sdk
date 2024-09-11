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

interface CreateAbstractClientParameters {
  signer: Account;
  chain: ChainEIP712;
}

type AbstractClientActions = AbstractWalletActions<ChainEIP712, Account>;

export type AbstractClient = Client<Transport, ChainEIP712, Account> &
  AbstractClientActions;

export async function createAbstractClient(
  parameters: CreateAbstractClientParameters,
): Promise<AbstractClient> {
  const { signer, chain } = parameters;

  const transport = http();

  // Create public client for reading contract code
  const publicClient = createPublicClient({
    chain: chain,
    transport: http(),
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
    transport
  });

  const abstractClient = baseClient.extend(
    globalWalletActions(signerWalletClient, publicClient),
  );
  return abstractClient as AbstractClient;
}
