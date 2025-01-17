import {
  type Account,
  type Address,
  type Client,
  getAddress,
  InvalidAddressError,
  isAddress,
  type Transport,
} from 'viem';
import { readContract } from 'viem/actions';
import { getAction } from 'viem/utils';
import { type ChainEIP712 } from 'viem/zksync';

import { ExclusiveDelegateResolverAbi } from '../abis/ExclusiveDelegateResolver.js';
import {
  AGW_LINK_DELEGATION_RIGHTS,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
} from '../constants.js';

export interface GetLinkedAgwReturnType {
  linkedAccounts: Address[];
}

export interface GetLinkedAgwParameters {
  agwAddress: Address;
}

export async function getLinkedAgw(
  client: Client<Transport, ChainEIP712, Account>,
  parameters: GetLinkedAgwParameters,
): Promise<GetLinkedAgwReturnType> {
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
