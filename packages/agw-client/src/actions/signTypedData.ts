import {
  type Account,
  type Client,
  encodeAbiParameters,
  hashTypedData,
  type Hex,
  parseAbiParameters,
  type Transport,
  type WalletClient,
} from 'viem';
import type { SignTypedDataParameters } from 'viem/accounts';
import type { ChainEIP712 } from 'viem/chains';

import { VALIDATOR_ADDRESS } from '../constants.js';
import { isEIP712Transaction } from '../eip712.js';
import { getAgwTypedSignature } from '../getAgwTypedSignature.js';

export async function signTypedData(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
): Promise<Hex> {
  // if the typed data is already a zkSync EIP712 transaction, don't try to transform it
  // to an AGW typed signature, just pass it through to the signer.
  if (
    parameters.message &&
    parameters.domain?.name === 'zkSync' &&
    isEIP712Transaction(parameters.message)
  ) {
    return await signerClient.signTypedData(parameters);
  }

  const rawSignature = await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashTypedData(parameters),
  });

  // Match the expect signature format of the AGW smart account so the result can be
  // directly used in eth_sendRawTransaction as the customSignature field
  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address', 'bytes[]']),
    [rawSignature, VALIDATOR_ADDRESS, []],
  );
  return signature;
}
