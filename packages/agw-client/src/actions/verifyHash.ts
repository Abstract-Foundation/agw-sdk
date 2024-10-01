import {
  bytesToHex,
  CallExecutionError,
  type CallParameters,
  type Chain,
  type Client,
  encodeFunctionData,
  getAddress,
  hexToBool,
  isAddressEqual,
  isErc6492Signature,
  isHex,
  recoverAddress,
  serializeErc6492Signature,
  serializeSignature,
  type Transport,
} from 'viem';
import {
  call,
  verifyHash as viemVerifyHash,
  type VerifyHashParameters,
  type VerifyHashReturnType,
} from 'viem/actions';
import { abstractTestnet } from 'viem/chains';
import { getAction } from 'viem/utils';

import UniversalSignatureValidatorAbi from '../abis/UniversalSigValidator.js';
import { UNIVERSAL_SIGNATURE_VALIDATOR_ADDRESS } from '../constants.js';

const supportedChains: (number | undefined)[] = [abstractTestnet.id];

/**
 * Verifies a message hash onchain using ERC-6492.
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyHashParameters}
 * @returns Whether or not the signature is valid. {@link VerifyHashReturnType}
 */
export async function verifyHash<chain extends Chain>(
  client: Client<Transport, chain>,
  parameters: VerifyHashParameters,
): Promise<VerifyHashReturnType> {
  const { address, factory, factoryData, hash, signature, ...rest } =
    parameters;

  if (!supportedChains.includes(client.chain.id)) {
    return await viemVerifyHash(client, parameters);
  }

  const signatureHex = (() => {
    if (isHex(signature)) return signature;
    if (typeof signature === 'object' && 'r' in signature && 's' in signature)
      return serializeSignature(signature);
    return bytesToHex(signature);
  })();

  const wrappedSignature = await (async () => {
    // If no `factory` or `factoryData` is provided, it is assumed that the
    // address is not a Smart Account, or the Smart Account is already deployed.
    if (!factory && !factoryData) return signatureHex;

    // If the signature is already wrapped, return the signature.
    if (isErc6492Signature(signatureHex)) return signatureHex;

    // If the Smart Account is not deployed, wrap the signature with a 6492 wrapper
    // to perform counterfactual validation.
    return serializeErc6492Signature({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      address: factory!,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      data: factoryData!,
      signature: signatureHex,
    });
  })();

  try {
    const { data } = await getAction(
      client,
      call,
      'call',
    )({
      to: UNIVERSAL_SIGNATURE_VALIDATOR_ADDRESS,
      data: encodeFunctionData({
        abi: UniversalSignatureValidatorAbi,
        functionName: 'isValidUniversalSig',
        args: [address, hash, wrappedSignature],
      }),
      ...rest,
    } as unknown as CallParameters);

    const isValid = hexToBool(data ?? '0x0');

    return isValid;
  } catch (error) {
    // Fallback attempt to verify the signature via ECDSA recovery.
    try {
      const verified = isAddressEqual(
        getAddress(address),
        await recoverAddress({ hash, signature }),
      );
      if (verified) return true;
      // eslint-disable-next-line no-empty
    } catch {}

    if (error instanceof CallExecutionError) {
      // if the execution fails, the signature was not valid and an internal method inside of the validator reverted
      // this can happen for many reasons, for example if signer can not be recovered from the signature
      // or if the signature has no valid format
      return false;
    }

    throw error;
  }
}
