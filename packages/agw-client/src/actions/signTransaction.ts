import {
  type Account,
  type Address,
  BaseError,
  type Client,
  encodeAbiParameters,
  type Hex,
  parseAbiParameters,
  type Transport,
  type UnionRequiredBy,
  type WalletClient,
} from 'viem';
import { getChainId, readContract, signTypedData } from 'viem/actions';
import { assertCurrentChain, getAction, parseAccount } from 'viem/utils';
import {
  type ChainEIP712,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  type TransactionRequestEIP712,
} from 'viem/zksync';

import AGWAccountAbi from '../abis/AGWAccount.js';
import {
  assertEip712Request,
  type AssertEip712RequestParameters,
} from '../eip712.js';
import { AccountNotFoundError } from '../errors/account.js';
import { VALID_CHAINS } from '../utils.js';
import { transformHexValues } from '../utils.js';

export interface CustomPaymasterParameters {
  nonce: number;
  from: Address;
  to: Address;
  gas: bigint;
  gasPrice: bigint;
  gasPerPubdata: bigint;
  value: bigint;
  data: Hex | undefined;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  chainId: number;
}

export type CustomPaymasterHandler = (
  args: CustomPaymasterParameters,
) => Promise<{
  paymaster: Address;
  paymasterInput: Hex;
}>;

export async function signTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  args: SignEip712TransactionParameters<chain, account, chainOverride>,
  validator: Address,
  useSignerAddress = false,
  validationHookData: Record<string, Hex> = {},
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SignEip712TransactionReturnType> {
  const chain = client.chain;

  if (!chain?.serializers?.transaction)
    throw new BaseError('transaction serializer not found on chain.');

  const { transaction, customSignature } = await signEip712TransactionInternal(
    client,
    signerClient,
    args,
    validator,
    useSignerAddress,
    validationHookData,
    customPaymasterHandler,
  );

  return chain.serializers.transaction(
    {
      ...transaction,
      customSignature,
      type: 'eip712',
    } as any,
    { r: '0x0', s: '0x0', v: 0n },
  ) as SignEip712TransactionReturnType;
}

export async function signEip712TransactionInternal<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  args: SignEip712TransactionParameters<chain, account, chainOverride>,
  validator: Address,
  useSignerAddress = false,
  validationHookData: Record<string, Hex> = {},
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<{
  transaction: UnionRequiredBy<TransactionRequestEIP712, 'from'> & {
    chainId: number;
  };
  customSignature: Hex;
}> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    ...transaction
  } = args;
  // TODO: open up typing to allow for eip712 transactions
  transaction.type = 'eip712' as any;
  transformHexValues(transaction, [
    'value',
    'nonce',
    'maxFeePerGas',
    'maxPriorityFeePerGas',
    'gas',
    'value',
    'chainId',
    'gasPerPubdata',
  ]);

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTransaction',
    });
  const smartAccount = parseAccount(account_);
  const fromAccount = useSignerAddress ? signerClient.account : smartAccount;

  assertEip712Request({
    account: fromAccount,
    chain,
    ...(transaction as AssertEip712RequestParameters),
  });

  if (!chain || VALID_CHAINS[chain.id] === undefined) {
    throw new BaseError('Invalid chain specified');
  }

  if (!chain?.custom?.getEip712Domain)
    throw new BaseError('`getEip712Domain` not found on chain.');

  const chainId = await getAction(client, getChainId, 'getChainId')({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain: chain,
    });

  const transactionWithPaymaster = await getTransactionWithPaymasterData(
    chainId,
    fromAccount,
    transaction,
    customPaymasterHandler,
  );

  const eip712Domain = chain?.custom.getEip712Domain({
    ...transactionWithPaymaster,
    type: 'eip712',
  });

  const rawSignature = await signTypedData(signerClient, {
    ...eip712Domain,
    account: signerClient.account,
  });

  let signature;
  if (useSignerAddress) {
    signature = rawSignature;
  } else {
    const hookData: Hex[] = [];
    if (!useSignerAddress) {
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
      for (const hook of validationHooks) {
        hookData.push(validationHookData[hook] ?? '0x');
      }
    }
    // Match the expect signature format of the AGW smart account
    signature = encodeAbiParameters(
      parseAbiParameters(['bytes', 'address', 'bytes[]']),
      [rawSignature, validator, hookData],
    );
  }

  return {
    transaction: transactionWithPaymaster,
    customSignature: signature,
  };
}

async function getTransactionWithPaymasterData(
  chainId: number,
  fromAccount: Account,
  transaction: TransactionRequestEIP712,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<
  UnionRequiredBy<TransactionRequestEIP712, 'from'> & { chainId: number }
> {
  if (
    customPaymasterHandler &&
    !transaction.paymaster &&
    !transaction.paymasterInput
  ) {
    const paymasterResult = await customPaymasterHandler({
      chainId,
      from: fromAccount.address,
      data: transaction.data,
      gas: transaction.gas ?? 0n,
      gasPrice: transaction.gasPrice ?? 0n,
      gasPerPubdata: transaction.gasPerPubdata ?? 0n,
      maxFeePerGas: transaction.maxFeePerGas ?? 0n,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ?? 0n,
      nonce: transaction.nonce ?? 0,
      to: transaction.to ?? '0x0',
      value: transaction.value ?? 0n,
    });
    return {
      ...transaction,
      ...paymasterResult,
      from: fromAccount.address,
      chainId,
    };
  }
  return {
    ...transaction,
    from: fromAccount.address,
    chainId,
  };
}
