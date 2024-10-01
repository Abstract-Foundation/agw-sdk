import { isAddressEqual } from 'viem';
import type {
  ValidateSiweMessageParameters,
  ValidateSiweMessageReturnType,
} from 'viem/_types/utils/siwe/validateSiweMessage';

/**
 * @description Validates EIP-4361 message.
 *
 * @see https://eips.ethereum.org/EIPS/eip-4361
 */
export function validateSiweMessage(
  parameters: ValidateSiweMessageParameters,
): ValidateSiweMessageReturnType {
  const {
    address,
    domain,
    message,
    nonce,
    scheme,
    time = new Date(),
  } = parameters;

  if (domain && message.domain !== domain) return false;
  if (nonce && message.nonce !== nonce) return false;
  if (scheme && message.scheme !== scheme) return false;

  if (message.expirationTime && time >= message.expirationTime) return false;
  if (message.notBefore && time < message.notBefore) return false;

  try {
    if (!message.address) return false;
    if (address && !isAddressEqual(message.address, address)) return false;
  } catch {
    return false;
  }

  return true;
}
