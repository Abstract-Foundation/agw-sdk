import {
  type Account,
  type Address,
  checksumAddress,
  type Client,
  getAddress,
  InvalidAddressError,
  isAddress,
  type Transport,
} from 'viem';
import { readContract } from 'viem/actions';
import { getAction, parseAccount } from 'viem/utils';
import { type ChainEIP712 } from 'viem/zksync';

import { ExclusiveDelegateResolverAbi } from '../abis/ExclusiveDelegateResolver.js';
import {
  AGW_LINK_DELEGATION_RIGHTS,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
} from '../constants.js';
import { AccountNotFoundError } from '../errors/account.js';

export interface GetLinkedAccountsReturnType {
  linkedAccounts: Address[];
}

export interface GetLinkedAccountsParameters {
  agwAddress: Address;
}

export interface IsLinkedAccountParameters {
  address: Address;
}

export async function getLinkedAccounts<
  transport extends Transport = Transport,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
  parameters: GetLinkedAccountsParameters,
): Promise<GetLinkedAccountsReturnType> {
  const { agwAddress } = parameters;

  if (!isAddress(agwAddress, { strict: false })) {
    throw new InvalidAddressError({ address: agwAddress });
  }

  const checksummedAddress = getAddress(agwAddress);

  const result = await getAction(
    client,
    readContract,
    'readContract',
  )({
    abi: ExclusiveDelegateResolverAbi,
    address: CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
    functionName: 'delegatedWalletsByRights',
    args: [checksummedAddress, AGW_LINK_DELEGATION_RIGHTS],
  });

  return {
    linkedAccounts: [...result],
  };
}

export async function isLinkedAccount(
  client: Client<Transport, ChainEIP712, Account>,
  parameters: IsLinkedAccountParameters,
): Promise<boolean> {
  const { address } = parameters;
  if (!client.account) {
    throw new AccountNotFoundError({
      docsPath: '/docs/contract/readContract',
    });
  }
  const clientAccount = parseAccount(client.account);
  const { linkedAccounts } = await getLinkedAccounts(client, {
    agwAddress: clientAccount.address,
  });

  return linkedAccounts.includes(checksumAddress(address));
}
