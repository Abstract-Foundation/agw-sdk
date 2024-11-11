import {
  type Account,
  type Client,
  hashMessage,
  type Hex,
  type SignMessageParameters,
  type Transport,
  type WalletClient,
} from 'viem';
import type { ChainEIP712 } from 'viem/chains';

import { getAgwTypedSignature } from '../getAgwTypedSignature.js';
import { sendPrivySignMessage } from './sendPrivyTransaction.js';

export async function signMessage(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignMessageParameters, 'account'>,
  isPrivyCrossApp = false,
): Promise<Hex> {
  // We handle {message: {raw}} here because the message is expected to be a string
  if (typeof parameters.message === 'object')
    parameters.message = parameters.message.raw.toString();

  if (isPrivyCrossApp) {
    return await sendPrivySignMessage(client, parameters);
  }

  return await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashMessage(parameters.message),
  });
}
