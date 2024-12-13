import {
  type Account,
  type Client,
  concatHex,
  type Hash,
  type Transport,
} from 'viem';
import { readContract, writeContract } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import SessionKeyValidatorAbi from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { encodeSession, type SessionConfig } from '../sessions.js';

export interface CreateSessionParameters {
  session: SessionConfig;
}

export interface CreateSessionReturnType {
  transactionHash: Hash | undefined;
  session: SessionConfig;
}

export async function createSession(
  client: Client<Transport, ChainEIP712, Account>,
  args: CreateSessionParameters,
): Promise<CreateSessionReturnType> {
  const {
    session,
    // parameters
  } = args;

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

  let transactionHash: Hash | undefined = undefined;

  if (!hasSessionModule) {
    const encodedSession = encodeSession(session);
    transactionHash = await getAction(
      client,
      writeContract,
      'writeContract',
    )({
      account: client.account,
      chain: client.chain,
      address: client.account.address,
      abi: AGWAccountAbi,
      functionName: 'addModule',
      args: [concatHex([SESSION_KEY_VALIDATOR_ADDRESS, encodedSession])],
    });
  } else {
    transactionHash = await getAction(
      client,
      writeContract,
      'writeContract',
    )({
      account: client.account,
      chain: client.chain,
      address: SESSION_KEY_VALIDATOR_ADDRESS,
      abi: SessionKeyValidatorAbi,
      functionName: 'createSession',
      args: [session as any],
    });
  }

  return { transactionHash, session };
}
