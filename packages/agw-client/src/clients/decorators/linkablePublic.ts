import type { Account, Client, Transport } from 'viem';
import type { ChainEIP712 } from 'viem/chains';
import {
  type GetLinkedAccountsParameters,
  type GetLinkedAccountsReturnType,
  getLinkedAccounts,
} from '../../actions/getLinkedAccounts.js';
import {
  type GetLinkedAgwParameters,
  type GetLinkedAgwReturnType,
  getLinkedAgw,
} from '../../actions/getLinkedAgw.js';

export interface LinkablePublicActions {
  getLinkedAgw: (
    args: GetLinkedAgwParameters,
  ) => Promise<GetLinkedAgwReturnType>;
  getLinkedAccounts: (
    args: GetLinkedAccountsParameters,
  ) => Promise<GetLinkedAccountsReturnType>;
}

export function linkablePublicActions<
  transport extends Transport = Transport,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>() {
  return (
    client: Client<transport, chain, account>,
  ): LinkablePublicActions => ({
    getLinkedAgw: (args) => getLinkedAgw(client, args),
    getLinkedAccounts: (args) => getLinkedAccounts(client, args),
  });
}
