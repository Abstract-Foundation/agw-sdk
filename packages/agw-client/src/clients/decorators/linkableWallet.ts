import {
  type Account,
  type Chain,
  type Transport,
  type WalletActions,
  type WalletClient,
  walletActions,
} from 'viem';
import {
  type GetLinkedAgwReturnType,
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
  getLinkedAgw: () => Promise<GetLinkedAgwReturnType>;
};

export function linkableWalletActions<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>() {
  return (
    client: WalletClient<transport, chain, account>,
  ): LinkableWalletActions<chain, account> => ({
    ...walletActions(client),
    linkToAgw: (args) => linkToAgw(client, args),
    getLinkedAgw: () => getLinkedAgw(client, {}),
  });
}
