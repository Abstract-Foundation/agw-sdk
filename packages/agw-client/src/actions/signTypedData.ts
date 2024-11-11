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
import { signTypedData as viemSignTypedData } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';

import { VALIDATOR_ADDRESS } from '../constants.js';
import { isEIP712Transaction } from '../eip712.js';
import { getAgwTypedSignature } from '../getAgwTypedSignature.js';
import { sendPrivySignTypedData } from './sendPrivyTransaction.js';

export async function signTypedData(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
  isPrivyCrossApp = false,
): Promise<Hex> {
  if (isPrivyCrossApp) return await sendPrivySignTypedData(client, parameters);

  // if the typed data is already a zkSync EIP712 transaction, don't try to transform it
  // to an AGW typed signature, just pass it through to the signer.
  if (
    parameters.message &&
    parameters.domain?.name === 'zkSync' &&
    isEIP712Transaction(parameters.message)
  ) {
    const rawSignature = await viemSignTypedData(signerClient, parameters);
    // Match the expect signature format of the AGW smart account so the result can be
    // directly used in eth_sendRawTransaction as the customSignature field
    const signature = encodeAbiParameters(
      parseAbiParameters(['bytes', 'address', 'bytes[]']),
      [rawSignature, VALIDATOR_ADDRESS, []],
    );
    return signature;
  }

  return await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashTypedData(parameters),
  });
}
