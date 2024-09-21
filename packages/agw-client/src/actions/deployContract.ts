import {
  type Abi,
  type Account,
  type Client,
  type Hex,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import {
  type ChainEIP712,
  type DeployContractParameters,
  type DeployContractReturnType,
  encodeDeployData,
  type SendEip712TransactionParameters,
} from 'viem/zksync';

import { CONTRACT_DEPLOYER_ADDRESS } from '../constants.js';
import { sendTransaction } from './sendTransaction.js';

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
