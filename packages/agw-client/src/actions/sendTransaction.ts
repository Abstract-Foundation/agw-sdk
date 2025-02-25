import {
  type Account,
  type Client,
  encodeFunctionData,
  keccak256,
  type PublicClient,
  type SendTransactionRequest,
  toBytes,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  type ChainEIP712,
  type SendEip712TransactionParameters,
  type SendEip712TransactionReturnType,
} from 'viem/zksync';

import AccountFactoryAbi from '../abis/AccountFactory.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import { type Call } from '../types/call.js';
import type {
  CustomPaymasterHandler,
  PaymasterArgs,
} from '../types/customPaymaster.js';
import { getInitializerCalldata, isSmartAccountDeployed } from '../utils.js';
import { sendPrivyTransaction } from './sendPrivyTransaction.js';
import { sendTransactionInternal } from './sendTransactionInternal.js';

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
  isPrivyCrossApp = false,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendEip712TransactionReturnType> {
  if (isPrivyCrossApp) {
    let paymasterData: Partial<PaymasterArgs> = {};
    // SendEip712TransactionParameters doesn't actually have paymaster or paymasterInput fields
    // defined, so we just have to cast to any here to access them
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestAsAny = parameters as any;
    if (
      customPaymasterHandler &&
      !requestAsAny.paymaster &&
      !requestAsAny.paymasterInput
    ) {
      paymasterData = await customPaymasterHandler({
        ...(parameters as any),
        from: client.account.address,
        chainId: parameters.chain?.id ?? client.chain.id,
      });
    }

    const updatedParameters = {
      ...parameters,
      ...(paymasterData as any),
    };
    return await sendPrivyTransaction(client, updatedParameters);
  }

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
    parameters.to = SMART_ACCOUNT_FACTORY_ADDRESS;
    parameters.data = deploymentCalldata;
  }

  return sendTransactionInternal(
    client,
    signerClient,
    publicClient,
    parameters,
    EOA_VALIDATOR_ADDRESS,
    !isDeployed,
    {},
    customPaymasterHandler,
  );
}
