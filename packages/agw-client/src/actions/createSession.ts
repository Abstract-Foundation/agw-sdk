import {
  type Account,
  type Address,
  type Call,
  type Client,
  concatHex,
  encodeFunctionData,
  type GetChainParameter,
  type Hash,
  type Hex,
  type Transport,
} from 'viem';
import { readContract, sendTransaction } from 'viem/actions';
import type { Chain } from 'viem/chains';
import { getAction, parseAccount } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import { SessionKeyValidatorAbi } from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { AccountNotFoundError } from '../errors/account.js';
import { encodeSession, type SessionConfig } from '../sessions.js';
import { isSmartAccountDeployed } from '../utils.js';
import type { GetAccountParameter } from './prepareTransaction.js';

export type CreateSessionParameters<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends Chain | undefined = Chain | undefined,
> = {
  session: SessionConfig;
  paymaster?: Address;
  paymasterInput?: Hex;
} & GetAccountParameter<account, Account | Address, true> &
  GetChainParameter<chain, chainOverride>;

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
export async function createSession<
  transport extends Transport,
  chain extends Chain | undefined = Chain,
  account extends Account | undefined = Account,
  chainOverride extends Chain | undefined = Chain | undefined,
>(
  client: Client<transport, chain, account>,
  args: CreateSessionParameters<chain, account, chainOverride>,
): Promise<CreateSessionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    session,
    ...rest
  } = args;

  if (typeof account_ === 'undefined')
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    });
  const account = parseAccount(account_);

  const createSessionCall = await prepareCreateSessionCall(
    account,
    client,
    session,
  );

  const transactionHash = await getAction(
    client,
    sendTransaction,
    'sendTransaction',
  )({
    ...createSessionCall,
    ...rest,
    account: account,
    chain: chain,
  });

  return { transactionHash, session };
}

export async function prepareCreateSessionCall<
  transport extends Transport,
  chain extends Chain | undefined = Chain,
  account extends Account | undefined = Account,
>(
  accountOrAddress: Account | Address,
  client: Client<transport, chain, account>,
  session: SessionConfig,
): Promise<Call> {
  const account = parseAccount(accountOrAddress);

  const isDeployed = await isSmartAccountDeployed(client, account.address);

  const hasModule = isDeployed
    ? await hasSessionModule(account, client)
    : false;

  if (!hasModule) {
    const encodedSession = encodeSession(session);
    return {
      to: account.address,
      value: 0n,
      data: encodeFunctionData({
        abi: AGWAccountAbi,
        functionName: 'addModule',
        args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodedSession])],
      }),
    };
  } else {
    return {
      to: SESSION_KEY_VALIDATOR_ADDRESS,
      value: 0n,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [session],
      }),
    };
  }
}

async function hasSessionModule<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain,
  account extends Account | undefined = Account,
>(account: Account, client: Client<transport, chain, account>) {
  const validationHooks = await getAction(
    client,
    readContract,
    'readContract',
  )({
    address: account.address,
    abi: AGWAccountAbi,
    functionName: 'listHooks',
    args: [true],
  });

  const hasSessionModule = validationHooks.some(
    (hook) => hook === SESSION_KEY_VALIDATOR_ADDRESS,
  );

  return hasSessionModule;
}
