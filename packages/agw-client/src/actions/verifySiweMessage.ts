import { type Chain, type Client, hashMessage, type Transport } from 'viem';
import type {
  VerifySiweMessageParameters,
  VerifySiweMessageReturnType,
} from 'viem/_types/actions/siwe/verifySiweMessage';

import { parseSiweMessage } from '../utils/siwe/parseSiweMessage';
import { validateSiweMessage } from '../utils/siwe/validateSiweMessage';
import { verifyHash } from './verifyHash';

/**
 * Verifies [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) formatted message was signed.
 *
 * Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
 *
 * - Docs {@link https://viem.sh/docs/siwe/actions/verifySiweMessage}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifySiweMessageParameters}
 * @returns Whether or not the signature is valid. {@link VerifySiweMessageReturnType}
 */
export async function verifySiweMessage<chain extends Chain>(
  client: Client<Transport, chain>,
  parameters: VerifySiweMessageParameters,
): Promise<VerifySiweMessageReturnType> {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    signature,
    time = new Date(),
    ...callRequest
  } = parameters;

  const parsed = parseSiweMessage(message);
  if (!parsed.address) return false;

  const isValid = validateSiweMessage({
    address,
    domain,
    message: parsed,
    nonce,
    scheme,
    time,
  });
  if (!isValid) return false;

  const hash = hashMessage(message);
  return verifyHash(client, {
    address: parsed.address,
    hash,
    signature,
    ...callRequest,
  });
}
