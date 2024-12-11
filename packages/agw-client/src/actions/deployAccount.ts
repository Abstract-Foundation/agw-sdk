import {
  type Account,
  type Address,
  encodeFunctionData,
  type Hash,
  type Hex,
  keccak256,
  type PublicClient,
  toBytes,
  type Transport,
  type WalletClient,
  zeroAddress,
} from 'viem';
import type { ChainEIP712 } from 'viem/chains';

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

export interface DeployAccountParameters {
  walletClient: WalletClient<Transport, ChainEIP712, Account>;
  publicClient: PublicClient<Transport, ChainEIP712>;
  initialSignerAddress?: Address;
  paymaster?: Address;
  paymasterInput?: Hex;
}

export interface DeployAccountReturnType {
  smartAccountAddress: Address;
  deploymentTransaction: Hash | undefined;
}

export async function deployAccount(
  params: DeployAccountParameters,
): Promise<DeployAccountReturnType> {
  const {
    initialSignerAddress,
    walletClient,
    publicClient,
    paymaster,
    paymasterInput,
  } = params;

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
      paymaster,
      paymasterInput,
    });
  }

  return {
    smartAccountAddress: address,
    deploymentTransaction,
  };
}
