import type { Address } from 'abitype';
import {
  type Account,
  BaseError,
  type Chain,
  type Client,
  type DeriveAccount,
  type DeriveChain,
  encodeFunctionData,
  type ExactPartial,
  formatGwei,
  type FormattedTransactionRequest,
  type GetChainParameter,
  type GetTransactionRequestKzgParameter,
  type IsNever,
  keccak256,
  type NonceManager,
  type Prettify,
  type PublicClient,
  type SendTransactionParameters,
  toBytes,
  type TransactionRequest,
  type TransactionRequestEIP1559,
  type TransactionRequestEIP2930,
  type TransactionRequestEIP4844,
  type TransactionRequestEIP7702,
  type TransactionRequestLegacy,
  type Transport,
  type UnionOmit,
  type UnionRequiredBy,
  type WalletClient,
} from 'viem';
import { type ParseAccountErrorType } from 'viem/accounts';
import {
  type EstimateFeesPerGasErrorType,
  estimateGas,
  type EstimateGasErrorType,
  type EstimateGasParameters,
  type GetBlockErrorType,
  getChainId as getChainId_,
  getTransactionCount,
  type GetTransactionCountErrorType,
} from 'viem/actions';
import {
  assertRequest,
  type AssertRequestErrorType,
  getAction,
  type GetTransactionType,
  parseAccount,
} from 'viem/utils';
import {
  type ChainEIP712,
  estimateFee,
  type EstimateFeeParameters,
} from 'viem/zksync';

import {
  CONTRACT_DEPLOYER_ADDRESS,
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import { AccountFactoryAbi } from '../exports/constants.js';
import type { Call } from '../types/call.js';
import { isSmartAccountDeployed } from '../utils.js';
import { getInitializerCalldata } from '../utils.js';

export type IsUndefined<T> = [undefined] extends [T] ? true : false;

export const defaultParameters = [
  'blobVersionedHashes',
  'chainId',
  'fees',
  'gas',
  'nonce',
  'type',
] as const;

export type AssertRequestParameters = ExactPartial<
  SendTransactionParameters<Chain>
>;

export class MaxFeePerGasTooLowError extends BaseError {
  constructor({ maxPriorityFeePerGas }: { maxPriorityFeePerGas: bigint }) {
    super(
      `\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(
        maxPriorityFeePerGas,
      )} gwei).`,
      { name: 'MaxFeePerGasTooLowError' },
    );
  }
}

export type GetAccountParameter<
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined = Account | Address,
  required extends boolean = true,
> =
  IsUndefined<account> extends true
    ? required extends true
      ? { account: accountOverride | Account | Address }
      : { account?: accountOverride | Account | Address | undefined }
    : { account?: accountOverride | Account | Address | undefined };

export type PrepareTransactionRequestParameterType =
  | 'blobVersionedHashes'
  | 'chainId'
  | 'fees'
  | 'gas'
  | 'nonce'
  | 'sidecars'
  | 'type';
type ParameterTypeToParameters<
  parameterType extends PrepareTransactionRequestParameterType,
> = parameterType extends 'fees'
  ? 'maxFeePerGas' | 'maxPriorityFeePerGas' | 'gasPrice'
  : parameterType;

export type PrepareTransactionRequestRequest<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  ///
  _derivedChain extends ChainEIP712 | undefined = DeriveChain<
    chain,
    chainOverride
  >,
> = UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
  GetTransactionRequestKzgParameter & {
    /**
     * Nonce manager to use for the transaction request.
     */
    nonceManager?: NonceManager | undefined;
    /**
     * Parameters to prepare for the transaction request.
     *
     * @default ['blobVersionedHashes', 'chainId', 'fees', 'gas', 'nonce', 'type']
     */
    parameters?: readonly PrepareTransactionRequestParameterType[] | undefined;

    /**
     * Whether the transaction is the first transaction of the account.
     */
    isInitialTransaction?: boolean;
  };

export type PrepareTransactionRequestParameters<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  request extends PrepareTransactionRequestRequest<
    chain,
    chainOverride
  > = PrepareTransactionRequestRequest<chain, chainOverride>,
> = request &
  GetAccountParameter<account, accountOverride, false> &
  GetChainParameter<chain, chainOverride> &
  GetTransactionRequestKzgParameter<request> & {
    chainId?: number | undefined;
  };

export type PrepareTransactionRequestReturnType<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  accountOverride extends Account | Address | undefined =
    | Account
    | Address
    | undefined,
  request extends PrepareTransactionRequestRequest<
    chain,
    chainOverride
  > = PrepareTransactionRequestRequest<chain, chainOverride>,
  ///
  _derivedAccount extends Account | Address | undefined = DeriveAccount<
    account,
    accountOverride
  >,
  _derivedChain extends Chain | undefined = DeriveChain<chain, chainOverride>,
  _transactionType = request['type'] extends string | undefined
    ? request['type']
    : GetTransactionType<request> extends 'legacy'
      ? unknown
      : GetTransactionType<request>,
  _transactionRequest extends TransactionRequest =
    | (_transactionType extends 'legacy' ? TransactionRequestLegacy : never)
    | (_transactionType extends 'eip1559' ? TransactionRequestEIP1559 : never)
    | (_transactionType extends 'eip2930' ? TransactionRequestEIP2930 : never)
    | (_transactionType extends 'eip4844' ? TransactionRequestEIP4844 : never)
    | (_transactionType extends 'eip7702' ? TransactionRequestEIP7702 : never),
> = Prettify<
  UnionRequiredBy<
    Extract<
      UnionOmit<FormattedTransactionRequest<_derivedChain>, 'from'> &
        (_derivedChain extends Chain
          ? { chain: _derivedChain }
          : { chain?: undefined }) &
        (_derivedAccount extends Account
          ? { account: _derivedAccount; from: Address }
          : { account?: undefined; from?: undefined }),
      IsNever<_transactionRequest> extends true
        ? unknown
        : ExactPartial<_transactionRequest>
    > & { chainId?: number | undefined },
    ParameterTypeToParameters<
      request['parameters'] extends readonly PrepareTransactionRequestParameterType[]
        ? request['parameters'][number]
        : (typeof defaultParameters)[number]
    >
  > &
    (unknown extends request['kzg'] ? {} : Pick<request, 'kzg'>)
>;

export type PrepareTransactionRequestErrorType =
  | AssertRequestErrorType
  | ParseAccountErrorType
  | GetBlockErrorType
  | GetTransactionCountErrorType
  | EstimateGasErrorType
  | EstimateFeesPerGasErrorType;

/**
 * Prepares a transaction request for signing.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest
 *
 * @param args - {@link PrepareTransactionRequestParameters}
 * @returns The transaction request. {@link PrepareTransactionRequestReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 *
 * @example
 * // Account Hoisting
 * import { createWalletClient, http } from 'viem'
 * import { privateKeyToAccount } from 'viem/accounts'
 * import { mainnet } from 'viem/chains'
 * import { prepareTransactionRequest } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   account: privateKeyToAccount('0x…'),
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const request = await prepareTransactionRequest(client, {
 *   to: '0x0000000000000000000000000000000000000000',
 *   value: 1n,
 * })
 */
export async function prepareTransactionRequest<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  accountOverride extends Account | Address | undefined = undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  const request extends PrepareTransactionRequestRequest<
    chain,
    chainOverride
  > = PrepareTransactionRequestRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  args: PrepareTransactionRequestParameters<
    chain,
    account,
    chainOverride,
    accountOverride,
    request
  >,
): Promise<PrepareTransactionRequestReturnType> {
  const {
    chain,
    gas,
    nonce,
    parameters: parameterNames = defaultParameters,
  } = args;

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );

  if (!isDeployed) {
    const initialCall = {
      target: args.to,
      allowFailure: false,
      value: args.value ?? 0,
      callData: args.data ?? '0x',
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      EOA_VALIDATOR_ADDRESS,
      initialCall,
    );
    const addressBytes = toBytes(signerClient.account.address);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    // Override transaction fields
    args.to = SMART_ACCOUNT_FACTORY_ADDRESS;
    args.data = deploymentCalldata;
  }

  const initiatorAccount = parseAccount(
    isDeployed ? client.account : signerClient.account,
  );
  const request = {
    ...args,
    from: initiatorAccount.address,
  };

  let chainId: number | undefined;
  async function getChainId(): Promise<number> {
    if (chainId) return chainId;
    if (chain) return chain.id;
    if (typeof args.chainId !== 'undefined') return args.chainId;
    const chainId_ = await getAction(client, getChainId_, 'getChainId')({});
    chainId = chainId_;
    return chainId;
  }

  if (parameterNames.includes('chainId')) request.chainId = await getChainId();

  if (
    parameterNames.includes('nonce') &&
    typeof nonce === 'undefined' &&
    initiatorAccount
  ) {
    request.nonce = await getAction(
      publicClient, // The public client is more reliable for fetching the latest nonce
      getTransactionCount,
      'getTransactionCount',
    )({
      address: initiatorAccount.address,
      blockTag: 'pending',
    });
  }

  let gasFromFeeEstimation: bigint | undefined;
  if (parameterNames.includes('fees')) {
    if (
      typeof request.maxFeePerGas === 'undefined' ||
      typeof request.maxPriorityFeePerGas === 'undefined'
    ) {
      let maxFeePerGas: bigint | undefined;
      let maxPriorityFeePerGas: bigint | undefined;
      // Skip fee estimation for contract deployments
      if (request.to === CONTRACT_DEPLOYER_ADDRESS) {
        maxFeePerGas = 25000000n;
        maxPriorityFeePerGas = 0n;
      } else {
        const estimateFeeRequest: EstimateFeeParameters<
          chain,
          account | undefined,
          ChainEIP712
        > = {
          account: initiatorAccount,
          to: request.to,
          value: request.value,
          data: request.data,
          gas: request.gas,
          nonce: request.nonce,
          chainId: request.chainId,
          authorizationList: [],
        };
        const feeEstimation = await estimateFee(
          publicClient,
          estimateFeeRequest,
        );
        maxFeePerGas = feeEstimation.maxFeePerGas;
        maxPriorityFeePerGas = feeEstimation.maxPriorityFeePerGas;
        gasFromFeeEstimation = feeEstimation.gasLimit;
      }

      if (
        typeof args.maxPriorityFeePerGas === 'undefined' &&
        args.maxFeePerGas &&
        args.maxFeePerGas < maxPriorityFeePerGas
      )
        throw new MaxFeePerGasTooLowError({
          maxPriorityFeePerGas,
        });

      request.maxPriorityFeePerGas = maxPriorityFeePerGas;
      request.maxFeePerGas = maxFeePerGas;
      // set gas to gasFromFeeEstimation if gas is not already set
      if (typeof gas === 'undefined') {
        request.gas = gasFromFeeEstimation;
      }
    }
  }

  if (
    parameterNames.includes('gas') &&
    typeof gas === 'undefined' &&
    gasFromFeeEstimation === undefined // if gas was set by fee estimation, don't estimate again
  )
    request.gas = await getAction(
      client,
      estimateGas,
      'estimateGas',
    )({
      ...request,
      account: initiatorAccount
        ? { address: initiatorAccount.address, type: 'json-rpc' }
        : undefined,
    } as EstimateGasParameters);

  assertRequest(request as AssertRequestParameters);

  delete request.parameters;
  delete request.isInitialTransaction;

  return request as any;
}
