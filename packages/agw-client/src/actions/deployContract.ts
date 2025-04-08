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

/**
 * Function to deploy a smart contract from the connected Abstract Global Wallet.
 *
 * This extends the deployContract function from Viem to include options for contract deployment on Abstract.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { erc20Abi } from "viem"; // example abi
 * import { abstractTestnet } from "viem/chains";
 *
 * export default function DeployContract() {
 *     const { data: agwClient } = useAbstractClient();
 *
 *     async function deployContract() {
 *         if (!agwClient) return;
 *
 *         const hash = await agwClient.deployContract({
 *             abi: erc20Abi, // Your smart contract ABI
 *             account: agwClient.account,
 *             bytecode: "0x...", // Your smart contract bytecode
 *             chain: abstractTestnet,
 *             args: [], // Constructor arguments
 *         });
 *     }
 * }
 * ```
 *
 * @param parameters - Contract deployment parameters
 * @param parameters.abi - The ABI of the contract to deploy (required)
 * @param parameters.bytecode - The bytecode of the contract to deploy (required)
 * @param parameters.account - The account to deploy the contract from (required)
 * @param parameters.chain - The chain to deploy the contract on, e.g. abstractTestnet / abstract (required)
 * @param parameters.args - Constructor arguments to call upon deployment
 * @param parameters.deploymentType - Specifies the type of contract deployment ('create', 'create2', 'createAccount', 'create2Account'). Defaults to 'create'
 * @param parameters.factoryDeps - An array of bytecodes of contracts that are dependencies for the contract being deployed
 * @param parameters.salt - Specifies a unique identifier for the contract deployment
 * @param parameters.gasPerPubdata - The amount of gas to pay per byte of data on Ethereum
 * @param parameters.paymaster - Address of the paymaster smart contract that will pay the gas fees (requires paymasterInput)
 * @param parameters.paymasterInput - Input data to the paymaster (requires paymaster)
 * @returns The hash of the transaction that deployed the contract
 */
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
