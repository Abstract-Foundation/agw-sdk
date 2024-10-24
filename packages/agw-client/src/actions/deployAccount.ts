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

import AccountFactoryAbi from '../abis/AccountFactory';
import { SMART_ACCOUNT_FACTORY_ADDRESS, VALIDATOR_ADDRESS } from '../constants';
import {
  getInitializerCalldata,
  getSmartAccountAddressFromInitialSigner,
  isSmartAccountDeployed,
} from '../utils';

export interface DeployAccountParameters {
  initialSignerAddress: Address;
  walletClient: WalletClient<Transport, ChainEIP712, Account>;
  publicClient: PublicClient<Transport, ChainEIP712>;
  paymaster?: Account;
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

  const address = await getSmartAccountAddressFromInitialSigner(
    initialSignerAddress,
    publicClient,
  );

  let deploymentTransaction: Hash | undefined = undefined;

  const isDeployed = await isSmartAccountDeployed(publicClient, address);
  if (!isDeployed) {
    const initializerCallData = getInitializerCalldata(
      initialSignerAddress,
      VALIDATOR_ADDRESS,
      {
        allowFailure: false,
        callData: '0x',
        value: 0n,
        target: zeroAddress,
      },
    );
    const addressBytes = toBytes(initialSignerAddress);
    const salt = keccak256(addressBytes);
    const deploymentCalldata = encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [salt, initializerCallData],
    });

    deploymentTransaction = await walletClient.sendTransaction({
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
