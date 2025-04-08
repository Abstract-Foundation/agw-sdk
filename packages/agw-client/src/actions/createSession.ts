import {
  type Account,
  type Address,
  type Client,
  concatHex,
  type Hash,
  type Hex,
  type PublicClient,
  type Transport,
} from 'viem';
import { readContract, writeContract } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import { SessionKeyValidatorAbi } from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { encodeSession, type SessionConfig } from '../sessions.js';
import { isSmartAccountDeployed } from '../utils.js';

export interface CreateSessionParameters {
  session: SessionConfig;
  paymaster?: Address;
  paymasterInput?: Hex;
}

export interface CreateSessionReturnType {
  transactionHash: Hash | undefined;
  session: SessionConfig;
}

/**
 * Creates a session key for an Abstract Global Wallet.
 *
 * Session keys enable temporary, permissioned access to a wallet, allowing specific actions
 * to be performed without requiring the wallet owner's signature for each transaction.
 *
 * @param args - Parameters for creating the session
 * @param args.session - Session key configuration object
 * @param args.paymaster - Optional address of a paymaster to sponsor the transaction
 * @param args.paymasterInput - Optional data for the paymaster
 * @returns Object containing the transaction hash of the session key creation and the session config
 *
 * @example
 * ```ts
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { LimitType } from "@abstract-foundation/agw-client/sessions";
 * import { toFunctionSelector, parseEther } from "viem";
 * import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";
 *
 * // Generate a new session key pair
 * const sessionPrivateKey = generatePrivateKey();
 * const sessionSigner = privateKeyToAccount(sessionPrivateKey);
 *
 * export default function CreateSession() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function createSession() {
 *     if (!agwClient) return;
 *
 *     const { session } = await agwClient.createSession({
 *       session: {
 *         signer: sessionSigner.address,
 *         expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
 *         feeLimit: {
 *           limitType: LimitType.Lifetime,
 *           limit: parseEther("1"),
 *           period: BigInt(0),
 *         },
 *         callPolicies: [
 *           {
 *             target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
 *             selector: toFunctionSelector("mint(address,uint256)"),
 *             valueLimit: {
 *               limitType: LimitType.Unlimited,
 *               limit: BigInt(0),
 *               period: BigInt(0),
 *             },
 *             maxValuePerUse: BigInt(0),
 *             constraints: [],
 *           }
 *         ],
 *         transferPolicies: [],
 *       },
 *     });
 *   }
 *
 *   return <button onClick={createSession}>Create Session</button>;
 * }
 * ```
 *
 * @see {@link SessionConfig} - The session configuration type
 * @see {@link encodeSession} - Function to encode a session configuration
 */
export async function createSession(
  client: Client<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  args: CreateSessionParameters,
): Promise<CreateSessionReturnType> {
  const { session, ...rest } = args;

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );

  const hasModule = isDeployed ? await hasSessionModule(client) : false;

  let transactionHash: Hash | undefined = undefined;

  if (!hasModule) {
    const encodedSession = encodeSession(session);
    transactionHash = await getAction(
      client,
      writeContract,
      'writeContract',
    )({
      address: client.account.address,
      abi: AGWAccountAbi,
      functionName: 'addModule',
      args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodedSession])],
      ...rest,
    } as any);
  } else {
    transactionHash = await getAction(
      client,
      writeContract,
      'writeContract',
    )({
      address: SESSION_KEY_VALIDATOR_ADDRESS,
      abi: SessionKeyValidatorAbi,
      functionName: 'createSession',
      args: [session as any],
      ...rest,
    } as any);
  }

  return { transactionHash, session };
}

async function hasSessionModule(
  client: Client<Transport, ChainEIP712, Account>,
) {
  const validationHooks = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: client.account.address,
    abi: AGWAccountAbi,
    functionName: 'listHooks',
    args: [true],
  });

  const hasSessionModule = validationHooks.some(
    (hook) => hook === SESSION_KEY_VALIDATOR_ADDRESS,
  );

  return hasSessionModule;
}
