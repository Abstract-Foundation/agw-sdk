import {
  type Account,
  type Chain,
  type Transport,
  type WalletActions,
  type WalletClient,
  walletActions,
} from 'viem';
import {
  type GetLinkedAgwAction,
  type GetLinkedAgwParameters,
  getLinkedAgw,
} from '../../actions/getLinkedAgw.js';
import {
  type LinkToAgwParameters,
  type LinkToAgwReturnType,
  linkToAgw,
} from '../../actions/linkToAgw.js';

export type LinkableWalletActions<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
> = WalletActions<chain, account> & {
  linkToAgw: (args: LinkToAgwParameters) => Promise<LinkToAgwReturnType>;
  getLinkedAgw: GetLinkedAgwAction<account>;
};

export function linkableWalletActions<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>() {
  return <
    clientTransport extends transport = transport,
    clientChain extends chain = chain,
    clientAccount extends account = account,
  >(
    client: WalletClient<clientTransport, clientChain, clientAccount>,
  ): LinkableWalletActions<clientChain, clientAccount> => ({
    ...walletActions(client),
    linkToAgw: (args) => linkToAgw(client, args),
    getLinkedAgw: ((parameters?: GetLinkedAgwParameters<clientAccount>) =>
      getLinkedAgw(
        client as WalletClient<clientTransport, clientChain, Account>,
        (parameters ?? {}) as GetLinkedAgwParameters<Account>,
      )) as GetLinkedAgwAction<clientAccount>,
  });
}
