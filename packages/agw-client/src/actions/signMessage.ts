import {
  type Account,
  bytesToString,
  type Client,
  fromHex,
  hashMessage,
  type Hex,
  type SignMessageParameters,
  type Transport,
  type WalletClient,
} from 'viem';
import type { ChainEIP712 } from 'viem/chains';

import { getAgwTypedSignature } from '../getAgwTypedSignature.js';
import { sendPrivySignMessage } from './sendPrivyTransaction.js';

/**
 * Function to sign messages using the connected Abstract Global Wallet.
 *
 * This method follows the EIP-1271 standard for contract signature verification.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 *
 * export default function SignMessage() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function signMessage() {
 *     if (!agwClient) return;
 *
 *     const signature = await agwClient.signMessage({
 *       message: "Hello, Abstract!",
 *     });
 *
 *     console.log("Signature:", signature);
 *   }
 * }
 * ```
 *
 * @param parameters - Parameters for signing a message
 * @param parameters.message - The message to sign. Can be a string or a hex value (required)
 * @returns A Promise containing the signature of the message
 */
export async function signMessage(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignMessageParameters, 'account'>,
  isPrivyCrossApp = false,
): Promise<Hex> {
  if (isPrivyCrossApp) {
    // We handle {message: {raw}} here because the message is expected to be a string
    if (typeof parameters.message === 'object') {
      if (parameters.message.raw instanceof Uint8Array) {
        parameters.message = bytesToString(parameters.message.raw);
      } else {
        parameters.message = fromHex(parameters.message.raw, 'string');
      }
    }
    return await sendPrivySignMessage(client, parameters);
  }

  return await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashMessage(parameters.message),
  });
}
