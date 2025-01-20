import {
  type Account,
  BaseError,
  type Client,
  encodeAbiParameters,
  hashTypedData,
  type Hex,
  parseAbiParameters,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
  type WalletClient,
} from 'viem';
import type { SignTypedDataParameters } from 'viem/accounts';
import { readContract, signTypedData as viemSignTypedData } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';
import { getAction } from 'viem/utils';

import AGWAccountAbi from '../abis/AGWAccount.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SESSION_KEY_VALIDATOR_ADDRESS,
} from '../constants.js';
import { getAgwTypedSignature } from '../getAgwTypedSignature.js';
import {
  encodeSessionWithPeriodIds,
  getPeriodIdsForTransaction,
  type SessionConfig,
} from '../sessions.js';
import { isEip712TypedData, transformEip712TypedData } from '../utils.js';
import { sendPrivySignTypedData } from './sendPrivyTransaction.js';
import { signEip712TransactionInternal } from './signTransaction.js';

export async function signTypedData(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
  isPrivyCrossApp = false,
): Promise<Hex> {
  if (isPrivyCrossApp) return await sendPrivySignTypedData(client, parameters);

  // if the typed data is already a zkSync EIP712 transaction, don't try to transform it
  // to an AGW typed signature, just pass it through to the signer.
  if (isEip712TypedData(parameters)) {
    const rawSignature = await viemSignTypedData(signerClient, parameters);
    // Match the expect signature format of the AGW smart account so the result can be
    // directly used in eth_sendRawTransaction as the customSignature field
    const hookData: Hex[] = [];
    const validationHooks = await getAction(
      client,
      readContract,
      'readContract',
    )({
      address: client.account.address,
      abi: AGWAccountAbi,
      functionName: 'listHooks',
      args: [true],
    });
    for (const _ of validationHooks) {
      hookData.push('0x');
    }

    const signature = encodeAbiParameters(
      parseAbiParameters(['bytes', 'address', 'bytes[]']),
      [rawSignature, EOA_VALIDATOR_ADDRESS, hookData],
    );
    return signature;
  }

  return await getAgwTypedSignature({
    client,
    signer: signerClient,
    messageHash: hashTypedData(parameters),
  });
}

export async function signTypedDataForSession<
  const typedData extends TypedData | Record<string, unknown>,
  primaryType extends string,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  parameters: TypedDataDefinition<typedData, primaryType>,
  session: SessionConfig,
): Promise<Hex> {
  // if the typed data is already a zkSync EIP712 transaction, don't try to transform it
  // to an AGW typed signature, just pass it through to the signer.
  if (!isEip712TypedData(parameters as any)) {
    throw new BaseError(
      'Session client can only sign EIP712 transactions as typed data',
    );
  }

  const transactionRequest = transformEip712TypedData(parameters as any);

  if (!transactionRequest.to) {
    throw new BaseError('Transaction must have a to address');
  }

  // Match the expect signature format of the AGW smart account so the result can be
  // directly used in eth_sendRawTransaction as the customSignature field
  const validationHookData = {
    [SESSION_KEY_VALIDATOR_ADDRESS]: encodeSessionWithPeriodIds(
      session,
      getPeriodIdsForTransaction({
        sessionConfig: session,
        target: transactionRequest.to,
        selector: (transactionRequest.data?.slice(0, 10) ?? '0x') as Hex,
        timestamp: BigInt(Math.floor(Date.now() / 1000)),
      }),
    ),
  };

  const { customSignature } = await signEip712TransactionInternal(
    client,
    signerClient,
    {
      chain: client.chain,
      ...transactionRequest,
    },
    SESSION_KEY_VALIDATOR_ADDRESS,
    false,
    validationHookData,
  );

  return customSignature;
}
