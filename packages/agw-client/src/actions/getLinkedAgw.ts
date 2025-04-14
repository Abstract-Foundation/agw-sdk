import {
  type Account,
  type Address,
  BaseError,
  type Chain,
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

export interface GetLinkedAgwReturnType {
  agw: Address | undefined;
}

export interface GetLinkedAgwParameters {
  address?: Address | undefined;
}

export interface IsLinkedAccountParameters {
  address: Address;
}

/**
 * Get the linked Abstract Global Wallet for an Ethereum Mainnet address.
 *
 * @example
 * ```tsx
 * import { linkableWalletActions } from "@abstract-foundation/agw-client";
 * import { createWalletClient, custom } from "viem";
 * import { sepolia } from "viem/chains";
 *
 * export default function CheckLinkedWallet() {
 *   async function checkLinkedWallet() {
 *     // Initialize a Viem Wallet client and extend it with linkableWalletActions
 *     const client = createWalletClient({
 *       chain: sepolia,
 *       transport: custom(window.ethereum!),
 *     }).extend(linkableWalletActions());
 *
 *     // Check if an address has a linked AGW
 *     const { agw } = await client.getLinkedAgw();
 *
 *     if (agw) {
 *       console.log("Linked AGW:", agw);
 *     } else {
 *       console.log("No linked AGW found");
 *     }
 *   }
 *
 *   return <button onClick={checkLinkedWallet}>Check Linked AGW</button>;
 * }
 * ```
 *
 * @param parameters - Parameters for getting the linked AGW
 * @param parameters.address - The Ethereum Mainnet address to check for a linked AGW. If not provided, defaults to the connected account's address
 * @returns Object containing the address of the linked AGW, or undefined if no AGW is linked
 */
export async function getLinkedAgw<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<Transport, chain, account>,
  parameters: GetLinkedAgwParameters,
): Promise<GetLinkedAgwReturnType> {
  const { address = client.account?.address } = parameters;

  if (address === undefined) {
    throw new BaseError('No address provided');
  }

  if (!isAddress(address, { strict: false })) {
    throw new InvalidAddressError({ address });
  }

  const checksummedAddress = getAddress(address);

  const result = await getAction(
    client,
    readContract,
    'readContract',
  )({
    abi: ExclusiveDelegateResolverAbi,
    address: CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
    functionName: 'exclusiveWalletByRights',
    args: [checksummedAddress, AGW_LINK_DELEGATION_RIGHTS],
  });

  if (result === checksummedAddress) {
    return {
      agw: undefined,
    };
  }

  return {
    agw: result,
  };
}

export async function isLinkedAccount(
  client: Client<Transport, ChainEIP712, Account>,
  parameters: IsLinkedAccountParameters,
): Promise<boolean> {
  const { address } = parameters;

  if (client.account === undefined) {
    throw new AccountNotFoundError({
      docsPath: '/docs/contract/readContract',
    });
  }

  const clientAccount = parseAccount(client.account);

  const { agw } = await getLinkedAgw(client, { address });
  return agw === clientAccount.address;
}
