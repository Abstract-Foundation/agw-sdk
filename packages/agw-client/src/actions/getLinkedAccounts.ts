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

/**
 * Get all accounts linked to an Abstract Global Wallet.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * export default function LinkedAccounts() {
 *     const { data: agwClient } = useAbstractClient();
 *
 *     async function fetchLinkedAccounts() {
 *         if (!agwClient) return;
 *
 *         const { linkedAccounts } = await agwClient.getLinkedAccounts({
 *             agwAddress: agwClient.account.address
 *         });
 *
 *         console.log(linkedAccounts); // Array of linked account addresses
 *     }
 * }
 * ```
 *
 * @param parameters - Parameters for getting linked accounts
 * @param parameters.agwAddress - Address of the Abstract Global Wallet to check for linked accounts (required)
 * @returns An object containing an array of linked account addresses
 */
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

/**
 * Check if an address is linked to the connected Abstract Global Wallet.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * export default function CheckLinkedAccount() {
 *     const { data: agwClient } = useAbstractClient();
 *     const addressToCheck = "0x...";
 *
 *     async function checkIfLinked() {
 *         if (!agwClient) return;
 *
 *         const isLinked = await agwClient.isLinkedAccount({
 *             address: addressToCheck
 *         });
 *
 *         console.log(isLinked); // true or false
 *     }
 * }
 * ```
 *
 * @param parameters - Parameters for checking linked account
 * @param parameters.address - Address to check if linked to the connected wallet (required)
 * @returns Boolean indicating if the address is linked to the connected wallet
 */
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
