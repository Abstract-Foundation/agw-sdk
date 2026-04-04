import type { Account, Client, Transport } from 'viem';
import type { ChainEIP712 } from 'viem/chains';
import {
  type GetLinkedAccountsParameters,
  type GetLinkedAccountsReturnType,
  getLinkedAccounts,
} from '../../actions/getLinkedAccounts.js';
import {
  type GetLinkedAgwAction,
  type GetLinkedAgwParameters,
  getLinkedAgw,
} from '../../actions/getLinkedAgw.js';

export interface LinkablePublicActions<
  account extends Account | undefined = Account | undefined,
> {
  getLinkedAgw: GetLinkedAgwAction<account>;
  getLinkedAccounts: (
    args: GetLinkedAccountsParameters,
  ) => Promise<GetLinkedAccountsReturnType>;
}

export function linkablePublicActions<
  transport extends Transport = Transport,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>() {
  return <
    clientTransport extends transport = transport,
    clientChain extends chain = chain,
    clientAccount extends account = account,
  >(
    client: Client<clientTransport, clientChain, clientAccount>,
  ): LinkablePublicActions<clientAccount> => ({
    getLinkedAgw: ((parameters?: GetLinkedAgwParameters<clientAccount>) =>
      getLinkedAgw(
        client as Client<clientTransport, clientChain, Account>,
        (parameters ?? {}) as GetLinkedAgwParameters<Account>,
      )) as GetLinkedAgwAction<clientAccount>,
    getLinkedAccounts: (args) => getLinkedAccounts(client, args),
  });
}
