import {
  type Account,
  type Address,
  type Client,
  concatHex,
  type GetChainParameter,
  type Hash,
  type Transport,
  type WalletClient,
} from 'viem';
import { readContract, writeContract } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import SessionKeyValidatorAbi from '../abis/SessionKeyValidator.js';
import { SESSION_KEY_VALIDATOR_ADDRESS } from '../constants.js';
import { encodeSession, type SessionConfig } from '../sessions.js';
import type { GetAccountParameter } from './prepareTransaction.js';

interface SessionWithSigner {
  session: Omit<SessionConfig, 'signer'>;
  signer: Signer;
}

interface AddressSigner {
  signerType: 'address';
  address: Address;
}

interface AccountSigner {
  signerType: 'account';
  account: Account;
}

interface WalletClientSigner {
  signerType: 'walletClient';
  walletClient: WalletClient<Transport, ChainEIP712, Account>;
}

type Signer = AddressSigner | AccountSigner | WalletClientSigner;

export interface CreateSessionParameters<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
> {
  session: SessionWithSigner;
  parameters?: GetChainParameter<chain, chainOverride> &
    GetAccountParameter<account, undefined, true>;
}

export interface CreateSessionReturnType {
  transactionHash: Hash | undefined;
  session: SessionConfig;
  sessionClient?: WalletClient<Transport, ChainEIP712, Account> | undefined;
}

export async function createSession<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  args: CreateSessionParameters<chain, account, chainOverride>,
): Promise<CreateSessionReturnType> {
  const {
    session: sessionArg,
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

  const session = {
    ...sessionArg.session,
    signer: getAddressFromSigner(sessionArg.signer),
  };

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
function getAddressFromSigner(signer: Signer) {
  switch (signer.signerType) {
    case 'address':
      return signer.address;
    case 'account':
      return signer.account.address;
    case 'walletClient':
      return signer.walletClient.account.address;
  }
}
