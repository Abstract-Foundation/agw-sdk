import {
  type Account,
  type Address,
  type Client,
  createClient,
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type NonceManager,
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

type GetNonceManagerParameter<account extends Account | Address = Address> =
  account extends Account
    ? { nonceManager?: never }
    : { nonceManager?: NonceManager };

type CreateSessionClientParameters<
  account extends Account | Address = Address,
> = {
  account: account;
  chain: ChainEIP712;
  signer: Account;
  session: SessionConfig;
  transport?: Transport;
  paymasterHandler?: CustomPaymasterHandler;
} & GetNonceManagerParameter<account>;

export type SessionClient = Client<Transport, ChainEIP712, Account> &
  SessionClientActions;

export interface ToSessionClientParams {
  client: AbstractClient;
  signer: Account;
  session: SessionConfig;
  paymasterHandler?: CustomPaymasterHandler;
}

/**
 * Function to create an AbstractClient using a session key.
 *
 * Creates a new SessionClient instance that can submit transactions and perform actions from
 * the Abstract Global wallet signed by a session key. If a transaction violates any of the
 * session key's policies, it will be rejected.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { parseAbi } from "viem";
 * import { abstractTestnet } from "viem/chains";
 * import { useAccount } from "wagmi";
 *
 * export default function Example() {
 *   const { address } = useAccount();
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function sendTransactionWithSessionKey() {
 *     if (!agwClient || !address) return;
 *
 *     // Use the existing session signer and session that you created with useCreateSession
 *     const sessionClient = agwClient.toSessionClient(sessionSigner, session);
 *
 *     const hash = await sessionClient.writeContract({
 *       abi: parseAbi(["function mint(address,uint256) external"]),
 *       account: sessionClient.account,
 *       chain: abstractTestnet,
 *       address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
 *       functionName: "mint",
 *       args: [address, BigInt(1)],
 *     });
 *   }
 *
 *   return <button onClick={sendTransactionWithSessionKey}>Send Transaction with Session Key</button>;
 * }
 * ```
 *
 * @param params - Parameters for creating a session client from an existing AbstractClient
 * @param params.client - The AbstractClient to create the session client from
 * @param params.signer - The account that will be used to sign transactions (must match the signer address in the session configuration)
 * @param params.session - The session configuration created by createSession
 * @param params.paymasterHandler - Optional custom paymaster handler
 * @returns A new AbstractClient instance that uses the session key for signing transactions
 */
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

/**
 * Function to create a new SessionClient without an existing AbstractClient.
 *
 * Creates a new SessionClient instance directly, without requiring an existing AbstractClient.
 * If you already have an AbstractClient, use the toSessionClient method instead.
 *
 * @example
 * ```tsx
 * import { createSessionClient } from "@abstract-foundation/agw-client/sessions";
 * import { abstractTestnet } from "viem/chains";
 * import { http, parseAbi } from "viem";
 * import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
 *
 * // The session signer (from createSession)
 * const sessionPrivateKey = generatePrivateKey();
 * const sessionSigner = privateKeyToAccount(sessionPrivateKey);
 *
 * // Create a session client directly
 * const sessionClient = createSessionClient({
 *   account: "0x1234...", // The Abstract Global Wallet address
 *   chain: abstractTestnet,
 *   signer: sessionSigner,
 *   session: {
 *     // ... See createSession docs for session configuration options
 *   },
 *   transport: http(), // Optional - defaults to http()
 * });
 *
 * // Use the session client to make transactions
 * const hash = await sessionClient.writeContract({
 *   address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
 *   abi: parseAbi(["function mint(address,uint256) external"]),
 *   functionName: "mint",
 *   args: [address, BigInt(1)],
 * });
 * ```
 *
 * @param params - Parameters for creating a session client directly
 * @param params.account - The Abstract Global Wallet address or Account object that the session key will act on behalf of (required)
 * @param params.chain - The chain configuration object that supports EIP-712 (required)
 * @param params.signer - The session key account that will be used to sign transactions (required)
 * @param params.session - The session configuration created by createSession (required)
 * @param params.transport - The transport configuration for connecting to the network (defaults to HTTP if not provided)
 * @param params.paymasterHandler - Optional custom paymaster handler
 * @param params.nonceManager - Optional nonce manager
 * @returns A new SessionClient instance that uses the session key for signing transactions
 */
export function createSessionClient<
  account extends Account | Address = Address,
>({
  account,
  signer,
  chain,
  transport,
  session,
  paymasterHandler,
  nonceManager,
}: CreateSessionClientParameters<account>) {
  if (!transport) {
    transport = http();
  }

  const publicClient = createPublicClient({
    transport,
    chain,
  });

  const parsedAccount: Account =
    typeof account === 'string' ? toAccount(account) : account;
  if (nonceManager) {
    parsedAccount.nonceManager = nonceManager;
  }

  const baseClient = createClient({
    account: parsedAccount,
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
