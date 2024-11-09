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

export async function signMessage(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignMessageParameters, 'account'>,
): Promise<Hex> {
  return await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashMessage(parameters.message),
  });
}
