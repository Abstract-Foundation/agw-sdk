import {
  type Account,
  BaseError,
  type Client,
  fromRlp,
  hashTypedData,
  type Hex,
  type PublicClient,
  type Transport,
  type TypedData,
  type TypedDataDefinition,
  type WalletClient,
} from 'viem';
import { type SignTypedDataParameters } from 'viem/accounts';
import type { ChainEIP712 } from 'viem/chains';

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
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { isEip712TypedData, transformEip712TypedData } from '../utils.js';
import { sendPrivySignTypedData } from './sendPrivyTransaction.js';
import {
  signEip712TransactionInternal,
  signTransaction,
} from './signTransaction.js';

export async function signTypedData(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: Omit<SignTypedDataParameters, 'account' | 'privateKey'>,
  isPrivyCrossApp = false,
): Promise<Hex> {
  // if the typed data is already a zkSync EIP712 transaction, don't try to transform it
  // to an AGW typed signature, just pass it through to the signer.
  if (isEip712TypedData(parameters)) {
    const transformedTypedData = transformEip712TypedData(parameters);

    if (transformedTypedData.chainId !== client.chain.id) {
      throw new BaseError('Chain ID mismatch in AGW typed signature');
    }

    const signedTransaction = await signTransaction(
      client,
      signerClient,
      publicClient,
      {
        ...transformedTypedData,
        chain: client.chain,
      },
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
      isPrivyCrossApp,
    );

    if (!signedTransaction.startsWith('0x71')) {
      throw new BaseError(
        'Expected RLP encoded EIP-712 transaction as signature',
      );
    }

    const rlpSignature: Hex = `0x${signedTransaction.slice(4)}`;

    const signatureParts = fromRlp(rlpSignature, 'hex');
    if (signatureParts.length < 15) {
      throw new BaseError(
        'Expected RLP encoded EIP-712 transaction with at least 15 fields',
      );
    }
    // This is somewhat not type safe as it assumes that the signature from signTransaction is an
    // RLP encoded 712 transaction and that the customSignature field is the 15th field in the transaction.
    // That being said, it's a safe assumption for the current use case.
    return signatureParts[14] as Hex;
  } else if (isPrivyCrossApp) {
    return await sendPrivySignTypedData(client, parameters);
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
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: TypedDataDefinition<typedData, primaryType>,
  session: SessionConfig,
  paymasterHandler?: CustomPaymasterHandler,
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
    publicClient,
    {
      chain: client.chain,
      ...transactionRequest,
    },
    SESSION_KEY_VALIDATOR_ADDRESS,
    validationHookData,
    paymasterHandler,
  );

  return customSignature;
}
