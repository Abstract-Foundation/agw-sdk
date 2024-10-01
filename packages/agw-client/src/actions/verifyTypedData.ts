import {
  type Chain,
  type Client,
  hashTypedData,
  type Transport,
  type TypedData,
  type VerifyTypedDataReturnType,
} from 'viem';
import type { VerifyTypedDataParameters } from 'viem/actions';

import { verifyHash } from './verifyHash';

/**
 * Verify that typed data was signed by the provided address.
 *
 * - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData}
 *
 * @param client - Client to use.
 * @param parameters - {@link VerifyTypedDataParameters}
 * @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
 */
export async function verifyTypedData<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends keyof typedData | 'EIP712Domain',
  chain extends Chain,
>(
  client: Client<Transport, chain>,
  parameters: VerifyTypedDataParameters<typedData, primaryType>,
): Promise<VerifyTypedDataReturnType> {
  const {
    address,
    factory,
    factoryData,
    signature,
    message,
    primaryType,
    types,
    domain,
    ...callRequest
  } = parameters as VerifyTypedDataParameters;
  const hash = hashTypedData({ message, primaryType, types, domain });
  return verifyHash(client, {
    address,
    factory: factory!,
    factoryData: factoryData!,
    hash,
    signature,
    ...callRequest,
  });
}
