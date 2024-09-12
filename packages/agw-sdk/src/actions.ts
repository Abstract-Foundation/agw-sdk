import {
  type Abi,
  type Account,
  type Address,
  type Chain,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  encodeAbiParameters,
  encodeFunctionData,
  type EncodeFunctionDataParameters,
  type ExactPartial,
  type Hex,
  keccak256,
  type OneOf,
  parseAbiParameters,
  type PublicClient,
  type SendTransactionRequest,
  type SendTransactionReturnType,
  toBytes,
  type Transport,
  type WalletClient,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem';
import { BaseError } from 'viem';
import { getChainId, sendRawTransaction, signTypedData } from 'viem/actions';
import { abstractTestnet } from 'viem/chains';
import {
  assertCurrentChain,
  assertRequest,
  getAction,
  getContractError,
  getTransactionError,
  type GetTransactionErrorParameters,
  parseAccount,
} from 'viem/utils';
import {
  type ChainEIP712,
  type DeployContractParameters,
  type DeployContractReturnType,
  type Eip712WalletActions,
  encodeDeployData,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
  type SignEip712TransactionParameters,
  type SignEip712TransactionReturnType,
  type ZksyncTransactionRequest,
  type ZksyncTransactionSerializable,
} from 'viem/zksync';

import AccountFactoryAbi from './AccountFactory.js';
import {
  BATCH_CALLER_ADDRESS,
  CONTRACT_DEPLOYER_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
  VALIDATOR_ADDRESS,
} from './constants.js';
import { prepareTransactionRequest } from './prepareTransaction.js';

const ALLOWED_CHAINS: number[] = [abstractTestnet.id];

export class AccountNotFoundError extends BaseError {
  constructor({ docsPath }: { docsPath?: string | undefined } = {}) {
    super(
      [
        'Could not find an Account to execute with this Action.',
        'Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client.',
      ].join('\n'),
      {
        docsPath,
        docsSlug: 'account',
        name: 'AccountNotFoundError',
      },
    );
  }
}

export class InvalidEip712TransactionError extends BaseError {
  constructor() {
    super(
      [
        'Transaction is not an EIP712 transaction.',
        '',
        'Transaction must:',
        '  - include `type: "eip712"`',
        '  - include one of the following: `customSignature`, `paymaster`, `paymasterInput`, `gasPerPubdata`, `factoryDeps`',
      ].join('\n'),
      { name: 'InvalidEip712TransactionError' },
    );
  }
}

export async function isSmartAccountDeployed<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  publicClient: PublicClient<Transport, chain>,
  address: Hex,
): Promise<boolean> {
  try {
    const bytecode = await publicClient.getCode({
      address: address,
    });
    return bytecode !== null && bytecode !== '0x' && bytecode !== undefined;
  } catch (error) {
    console.error('Error checking address:', error);
    return false;
  }
}

export interface SendTransactionBatchParameters<
  request extends SendTransactionRequest<Chain> = SendTransactionRequest<Chain>,
> {
  // TODO: figure out if more fields need to be lifted up
  calls: SendEip712TransactionParameters<Chain, Account, Chain, request>[];
  paymaster?: Address | undefined;
  paymasterInput?: Hex | undefined;
}

function isEIP712Transaction(
  transaction: ExactPartial<
    OneOf<ZksyncTransactionRequest | ZksyncTransactionSerializable>
  >,
) {
  if (transaction.type === 'eip712') return true;
  if (
    ('customSignature' in transaction && transaction.customSignature) ||
    ('paymaster' in transaction && transaction.paymaster) ||
    ('paymasterInput' in transaction && transaction.paymasterInput) ||
    ('gasPerPubdata' in transaction &&
      typeof transaction.gasPerPubdata === 'bigint') ||
    ('factoryDeps' in transaction && transaction.factoryDeps)
  )
    return true;
  return false;
}

export function assertEip712Request(args: AssertEip712RequestParameters) {
  if (!isEIP712Transaction(args as any))
    throw new InvalidEip712TransactionError();
  assertRequest(args as any);
}

export type AssertEip712RequestParameters = ExactPartial<
  SendEip712TransactionParameters<ChainEIP712>
>;

function getInitializerCalldata(
  initialOwnerAddress: Address,
  validatorAddress: Address,
  initialCall: Call,
): Hex {
  return encodeFunctionData({
    abi: [
      {
        name: 'initialize',
        type: 'function',
        inputs: [
          { name: 'initialK1Owner', type: 'address' },
          { name: 'initialK1Validator', type: 'address' },
          { name: 'modules', type: 'bytes[]' },
          {
            name: 'initCall',
            type: 'tuple',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' },
            ],
          },
        ],
        outputs: [],
        stateMutability: 'nonpayable',
      },
    ],
    functionName: 'initialize',
    args: [initialOwnerAddress, validatorAddress, [], initialCall],
  });
}

export async function signTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  args: SignEip712TransactionParameters<chain, account, chainOverride>,
  validatorAddress: Hex,
  useSignerAddress = false,
): Promise<SignEip712TransactionReturnType> {
  const {
    account: account_ = client.account,
    chain = client.chain,
    ...transaction
  } = args;
  // TODO: open up typing to allow for eip712 transactions
  transaction.type = 'eip712' as any;

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/signTransaction',
    });
  const smartAccount = parseAccount(account_);
  const fromAccount = useSignerAddress ? signerClient.account : smartAccount;

  assertEip712Request({
    account: smartAccount,
    chain,
    ...(transaction as AssertEip712RequestParameters),
  });

  if (!chain || !ALLOWED_CHAINS.includes(chain.id)) {
    throw new BaseError('Invalid chain specified');
  }

  if (!chain?.custom?.getEip712Domain)
    throw new BaseError('`getEip712Domain` not found on chain.');
  if (!chain?.serializers?.transaction)
    throw new BaseError('transaction serializer not found on chain.');

  const chainId = await getAction(client, getChainId, 'getChainId')({});
  if (chain !== null)
    assertCurrentChain({
      currentChainId: chainId,
      chain: chain,
    });

  const eip712Domain = chain?.custom.getEip712Domain({
    ...transaction,
    chainId,
    from: fromAccount.address,
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
    // Match the expect signature format of the AGW smart account
    signature = encodeAbiParameters(
      parseAbiParameters(['bytes', 'address', 'bytes[]']),
      [rawSignature, validatorAddress, []],
    );
  }

  return chain?.serializers?.transaction(
    {
      chainId,
      ...transaction,
      from: fromAccount.address,
      customSignature: signature,
      type: 'eip712' as any,
    },
    { r: '0x0', s: '0x0', v: 0n },
  ) as SignEip712TransactionReturnType;
}

export async function sendTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  const request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >,
  validatorAddress: Hex,
): Promise<SendEip712TransactionReturnType> {
  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    const initialCall = {
      target: parameters.to,
      allowFailure: false,
      value: parameters.value ?? 0,
      callData: parameters.data ?? '0x',
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      validatorAddress,
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
    parameters.to = SMART_ACCOUNT_FACTORY_ADDRESS;
    parameters.data = deploymentCalldata;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      parameters,
      validatorAddress,
      true,
    );
  } else {
    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      parameters,
      validatorAddress,
      false,
    );
  }
}

export async function _sendTransaction<
  const request extends SendTransactionRequest<chain, chainOverride>,
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendEip712TransactionParameters<
    chain,
    account,
    chainOverride,
    request
  >,
  validatorAddress: Hex,
  isInitialTransaction: boolean,
): Promise<SendEip712TransactionReturnType> {
  const { chain = client.chain } = parameters;

  if (!signerClient.account)
    throw new AccountNotFoundError({
      docsPath: '/docs/actions/wallet/sendTransaction',
    });
  const account = parseAccount(signerClient.account);

  try {
    // assertEip712Request(parameters)

    // Prepare the request for signing (assign appropriate fees, etc.)
    const request = await prepareTransactionRequest(
      client,
      signerClient,
      publicClient,
      {
        ...parameters,
        parameters: ['gas', 'nonce', 'fees'],
      } as any,
      isInitialTransaction,
    );

    let chainId: number | undefined;
    if (chain !== null) {
      chainId = await getAction(signerClient, getChainId, 'getChainId')({});
      assertCurrentChain({
        currentChainId: chainId,
        chain,
      });
    }

    const serializedTransaction = await signTransaction(
      client,
      signerClient,
      {
        ...request,
        chainId,
      } as any,
      validatorAddress,
      isInitialTransaction,
    );

    return await getAction(
      client,
      sendRawTransaction,
      'sendRawTransaction',
    )({
      serializedTransaction,
    });
  } catch (err) {
    throw getTransactionError(err as BaseError, {
      ...(parameters as GetTransactionErrorParameters),
      account,
      chain: chain as Chain,
    });
  }
}

interface Call {
  target: Address;
  allowFailure: boolean;
  value: bigint;
  callData: Hex;
}

export async function sendTransactionBatch<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  request extends SendTransactionRequest<
    chain,
    chainOverride
  > = SendTransactionRequest<chain, chainOverride>,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendTransactionBatchParameters<request>,
  validatorAddress: Hex,
): Promise<SendTransactionReturnType> {
  if (parameters.calls.length === 0) {
    throw new Error('No calls provided');
  }

  const calls: Call[] = parameters.calls.map((tx) => {
    if (!tx.to) throw new Error('Transaction target (to) is required');
    return {
      target: tx.to,
      allowFailure: false,
      value: BigInt(tx.value ?? 0),
      callData: tx.data ?? '0x',
    };
  });

  const batchCallData = encodeFunctionData({
    abi: [
      {
        name: 'batchCall',
        type: 'function',
        inputs: [
          {
            type: 'tuple[]',
            name: 'calls',
            components: [
              { name: 'target', type: 'address' },
              { name: 'allowFailure', type: 'bool' },
              { name: 'value', type: 'uint256' },
              { name: 'callData', type: 'bytes' },
            ],
          },
        ],
        outputs: [],
      },
    ],
    args: [calls],
  });

  // Get cumulative value passed in
  const totalValue = calls.reduce(
    (sum, call) => sum + BigInt(call.value),
    BigInt(0),
  );

  let batchTransaction;

  const isDeployed = await isSmartAccountDeployed(
    publicClient,
    client.account.address,
  );
  if (!isDeployed) {
    const initialCall = {
      target: BATCH_CALLER_ADDRESS,
      allowFailure: false,
      value: totalValue,
      callData: batchCallData,
    } as Call;

    // Create calldata for initializing the proxy account
    const initializerCallData = getInitializerCalldata(
      signerClient.account.address,
      validatorAddress,
      initialCall,
    );
    const addressBytes = toBytes(signerClient.account.address);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    batchTransaction = {
      to: SMART_ACCOUNT_FACTORY_ADDRESS,
      data: deploymentCalldata,
      value: totalValue,
      paymaster: parameters.paymaster,
      paymasterInput: parameters.paymasterInput,
      type: 'eip712',
    } as any;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      batchTransaction,
      validatorAddress,
      true,
    );
  } else {
    batchTransaction = {
      to: BATCH_CALLER_ADDRESS as Hex,
      data: batchCallData,
      value: totalValue,
      paymaster: parameters.paymaster,
      paymasterInput: parameters.paymasterInput,
      type: 'eip712',
    } as any;

    return _sendTransaction(
      client,
      signerClient,
      publicClient,
      batchTransaction,
      validatorAddress,
      false,
    );
  }
}

export async function writeContract<
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  const abi extends Abi | readonly unknown[],
  functionName extends ContractFunctionName<abi, 'nonpayable' | 'payable'>,
  args extends ContractFunctionArgs<
    abi,
    'nonpayable' | 'payable',
    functionName
  >,
  chainOverride extends ChainEIP712 | undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: WriteContractParameters<
    abi,
    functionName,
    args,
    chain,
    account,
    chainOverride
  >,
  validatorAddress: Hex,
): Promise<WriteContractReturnType> {
  const {
    abi,
    account: account_ = client.account,
    address,
    args,
    dataSuffix,
    functionName,
    ...request
  } = parameters as WriteContractParameters;

  if (!account_)
    throw new AccountNotFoundError({
      docsPath: '/docs/contract/writeContract',
    });
  const account = parseAccount(account_);

  const data = encodeFunctionData({
    abi,
    args,
    functionName,
  } as EncodeFunctionDataParameters);

  try {
    return await sendTransaction(
      client,
      signerClient,
      publicClient,
      {
        data: `${data}${dataSuffix ? dataSuffix.replace('0x', '') : ''}`,
        to: address,
        account,
        ...request,
      },
      validatorAddress,
    );
  } catch (error) {
    throw getContractError(error as BaseError, {
      abi,
      address,
      args,
      docsPath: '/docs/contract/writeContract',
      functionName,
      sender: account.address,
    });
  }
}

export function deployContract<
  const abi extends Abi | readonly unknown[],
  chain extends ChainEIP712 | undefined,
  account extends Account | undefined,
  chainOverride extends ChainEIP712 | undefined,
>(
  walletClient: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: DeployContractParameters<abi, chain, account, chainOverride>,
  validatorAddress: Hex,
): Promise<DeployContractReturnType> {
  const { abi, args, bytecode, deploymentType, salt, ...request } =
    parameters as DeployContractParameters;

  const data = encodeDeployData({
    abi,
    args,
    bytecode,
    deploymentType,
    salt,
  });

  // Add the bytecode to the factoryDeps if it's not already there
  request.factoryDeps = request.factoryDeps || [];
  if (!request.factoryDeps.includes(bytecode))
    request.factoryDeps.push(bytecode);

  return sendTransaction(
    walletClient,
    signerClient,
    publicClient,
    {
      ...request,
      data,
      to: CONTRACT_DEPLOYER_ADDRESS,
    } as unknown as SendEip712TransactionParameters<
      chain,
      account,
      chainOverride
    >,
    validatorAddress,
  );
}

export type AbstractWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
> = Eip712WalletActions<chain, account> & {
  sendTransactionBatch: <
    const request extends SendTransactionRequest<ChainEIP712>,
  >(
    args: SendTransactionBatchParameters<request>,
  ) => Promise<SendTransactionReturnType>;
};

export function globalWalletActions<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
>(
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
) {
  const validatorAddress = VALIDATOR_ADDRESS;
  return (
    client: Client<Transport, ChainEIP712, Account>,
  ): AbstractWalletActions<Chain, Account> => ({
    sendTransaction: (args) =>
      sendTransaction(
        client,
        signerClient,
        publicClient,
        args as SendEip712TransactionParameters<chain, account>,
        validatorAddress,
      ),
    sendTransactionBatch: (args) =>
      sendTransactionBatch(
        client,
        signerClient,
        publicClient,
        args,
        validatorAddress,
      ),
    signTransaction: (args) =>
      signTransaction(
        client,
        signerClient,
        args as SignEip712TransactionParameters<chain, account>,
        validatorAddress,
      ),
    deployContract: (args) =>
      deployContract(
        client,
        signerClient,
        publicClient,
        args,
        validatorAddress,
      ),
    writeContract: (args) =>
      writeContract(
        Object.assign(client, {
          sendTransaction: (
            args: SendEip712TransactionParameters<chain, account>,
          ) =>
            sendTransaction(
              client,
              signerClient,
              publicClient,
              args,
              validatorAddress,
            ),
        }),
        signerClient,
        publicClient,
        args as WriteContractParameters<
          Abi,
          string,
          readonly unknown[],
          ChainEIP712,
          Account
        >,
        validatorAddress,
      ),
  });
}
