import { type Chain, type Client, hashMessage, type Transport } from 'viem';
import type {
  VerifyMessageParameters,
  VerifyMessageReturnType,
} from 'viem/actions';

import { verifyHash } from './verifyHash';

/**
 * Verify that a message was signed by the provided address.
 *
 * Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyMessage}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifyMessageReturnType}
 */
export async function verifyMessage<chain extends Chain>(
  client: Client<Transport, chain>,
  {
    address,
    message,
    factory,
    factoryData,
    signature,
    ...callRequest
  }: VerifyMessageParameters,
): Promise<VerifyMessageReturnType> {
  const hash = hashMessage(message);
  return verifyHash(client, {
    address,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    factory: factory!,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    factoryData: factoryData!,
    hash,
    signature,
    ...callRequest,
  });
}
