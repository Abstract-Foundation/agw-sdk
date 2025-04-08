import {
  type Abi,
  type Account,
  BaseError,
  type Client,
  type ContractFunctionArgs,
  type ContractFunctionName,
  encodeFunctionData,
  type EncodeFunctionDataParameters,
  type PublicClient,
  type Transport,
  type WalletClient,
  type WriteContractParameters,
  type WriteContractReturnType,
} from 'viem';
import { getContractError, parseAccount } from 'viem/utils';
import { type ChainEIP712 } from 'viem/zksync';

import { AccountNotFoundError } from '../errors/account.js';
import { sendTransaction } from './sendTransaction.js';

/**
 * Function to call functions on a smart contract using the connected Abstract Global Wallet.
 *
 * @example
 * ```tsx
 * import { useAbstractClient } from "@abstract-foundation/agw-react";
 * import { parseAbi } from "viem";
 *
 * export default function WriteContract() {
 *   const { data: agwClient } = useAbstractClient();
 *
 *   async function writeContract() {
 *     if (!agwClient) return;
 *
 *     const transactionHash = await agwClient.writeContract({
 *       abi: parseAbi(["function mint(address,uint256) external"]), // Your contract ABI
 *       address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA",
 *       functionName: "mint",
 *       args: ["0x273B3527BF5b607dE86F504fED49e1582dD2a1C6", BigInt(1)],
 *     });
 *
 *     console.log("Transaction hash:", transactionHash);
 *   }
 * }
 * ```
 *
 * @param parameters - Parameters for writing to a contract
 * @param parameters.address - The address of the contract to write to (required)
 * @param parameters.abi - The ABI of the contract to write to (required)
 * @param parameters.functionName - The name of the function to call on the contract (required)
 * @param parameters.args - The arguments to pass to the function
 * @param parameters.account - The account to use for the transaction (defaults to the AGW's account)
 * @param parameters.chain - The chain to use for the transaction (defaults to the chain in the AbstractClient)
 * @param parameters.value - The amount of native token to send with the transaction (in wei)
 * @param parameters.dataSuffix - Data to append to the end of the calldata
 * @param parameters.gasPerPubdata - The amount of gas to pay per byte of data on Ethereum
 * @param parameters.paymaster - Address of the paymaster smart contract that will pay the gas fees
 * @param parameters.paymasterInput - Input data to the paymaster (required if paymaster is provided)
 * @returns The transaction hash of the contract write operation
 */
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
  isPrivyCrossApp = false,
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
      isPrivyCrossApp,
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
