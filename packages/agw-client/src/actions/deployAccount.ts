import {
  type Account,
  type Address,
  encodeFunctionData,
  type Hash,
  keccak256,
  type PublicClient,
  toBytes,
  type Transport,
  type WalletClient,
  zeroAddress,
} from 'viem';
import type { ChainEIP712, TransactionRequestEIP712 } from 'viem/chains';

import AccountFactoryAbi from '../abis/AccountFactory.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import {
  getInitializerCalldata,
  getSmartAccountAddressFromInitialSigner,
  isSmartAccountDeployed,
} from '../utils.js';

export type DeployAccountParameters = {
  walletClient: WalletClient<Transport, ChainEIP712, Account>;
  publicClient: PublicClient<Transport, ChainEIP712>;
  initialSignerAddress?: Address;
} & Omit<TransactionRequestEIP712, 'data' | 'from' | 'to' | 'value' | 'type'>;

export interface DeployAccountReturnType {
  smartAccountAddress: Address;
  deploymentTransaction: Hash | undefined;
}

export async function deployAccount(
  params: DeployAccountParameters,
): Promise<DeployAccountReturnType> {
  const { initialSignerAddress, walletClient, publicClient, ...rest } = params;

  const initialSigner = initialSignerAddress ?? walletClient.account.address;

  const address = await getSmartAccountAddressFromInitialSigner(
    initialSigner,
    publicClient,
  );

  let deploymentTransaction: Hash | undefined = undefined;

  const isDeployed = await isSmartAccountDeployed(publicClient, address);
  if (!isDeployed) {
    const initializerCallData = getInitializerCalldata(
      initialSigner,
      EOA_VALIDATOR_ADDRESS,
      {
        allowFailure: false,
        callData: '0x',
        value: 0n,
        target: zeroAddress,
      },
    );
    const addressBytes = toBytes(initialSigner);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    deploymentTransaction = await walletClient.sendTransaction({
      account: walletClient.account,
      to: SMART_ACCOUNT_FACTORY_ADDRESS,
      data: deploymentCalldata,
      ...rest,
    });
  }

  return {
    smartAccountAddress: address,
    deploymentTransaction,
  };
}
