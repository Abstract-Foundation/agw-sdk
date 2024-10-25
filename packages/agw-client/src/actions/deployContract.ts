import {
  type Abi,
  type Account,
  type Client,
  type ContractConstructorArgs,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  type ChainEIP712,
  type DeployContractParameters,
  type DeployContractReturnType,
  encodeDeployData,
} from 'viem/zksync';

import { CONTRACT_DEPLOYER_ADDRESS } from '../constants.js';
import { sendTransaction } from './sendTransaction.js';

export function deployContract<
  const abi extends Abi | readonly unknown[],
  chain extends ChainEIP712 | undefined = ChainEIP712,
  account extends Account | undefined = Account,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712,
  allArgs = ContractConstructorArgs<abi>,
>(
  walletClient: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: DeployContractParameters<
    abi,
    chain,
    account,
    chainOverride,
    allArgs
  >,
  isPrivyCrossApp = false,
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
    },
    isPrivyCrossApp,
  );
}
