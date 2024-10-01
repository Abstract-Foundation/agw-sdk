import {
  type Account,
  type Chain,
  type Client,
  type PublicActions,
  publicActions,
  type Transport,
} from 'viem';

import { verifyMessage } from './actions/verifyMessage';
import { verifySiweMessage } from './actions/verifySiweMessage';
import { verifyTypedData } from './actions/verifyTypedData';

export function abstractPublicActions<
  transport extends Transport = Transport,
  chain extends Chain = Chain,
  account extends Account | undefined = Account | undefined,
>(
  client: Client<transport, chain, account>,
): PublicActions<transport, chain, account> {
  return {
    ...publicActions(client),
    verifyMessage: (args) => verifyMessage(client, args),
    verifySiweMessage: (args) => verifySiweMessage(client, args),
    verifyTypedData: (args) => verifyTypedData(client, args),
  };
}
