import type { WalletClient } from 'viem';
import {
  type Account,
  type Client,
  encodeAbiParameters,
  encodeFunctionData,
  type Hash,
  type Hex,
  keccak256,
  parseAbiParameters,
  serializeErc6492Signature,
  toBytes,
  type Transport,
  zeroAddress,
} from 'viem';
import { getCode, signTypedData } from 'viem/actions';
import type { ChainEIP712 } from 'viem/chains';

import AccountFactoryAbi from './abis/AccountFactory.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from './constants.js';
import { getInitializerCalldata } from './utils.js';

export interface GetAgwTypedSignatureParams {
  client: Client<Transport, ChainEIP712, Account>;
  signer: WalletClient<Transport, ChainEIP712, Account>;
  messageHash: Hash;
}

export async function getAgwTypedSignature(
  args: GetAgwTypedSignatureParams,
): Promise<Hex> {
  const { client, signer, messageHash } = args;
  const chainId = client.chain.id;
  const account = client.account;

  const rawSignature = await signTypedData(signer, {
    domain: {
      name: 'AbstractGlobalWallet',
      version: '1.0.0',
      chainId: BigInt(chainId),
      verifyingContract: account.address,
    },
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      AGWMessage: [{ name: 'signedHash', type: 'bytes32' }],
    },
    message: {
      signedHash: messageHash,
    },
    primaryType: 'AGWMessage',
  });

  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address']),
    [rawSignature, EOA_VALIDATOR_ADDRESS],
  );

  const code = await getCode(client, {
    address: account.address,
  });

  // if the account is already deployed, we can use signature directly
  // otherwise, we provide an ERC-6492 compatible signature
  if (code !== undefined) {
    return signature;
  }

  // Generate the ERC-6492 compatible signature
  // https://eips.ethereum.org/EIPS/eip-6492

  // 1. Generate the salt for account deployment
  const addressBytes = toBytes(signer.account.address);
  const salt = keccak256(addressBytes);

  // 2. Generate the ERC-6492 compatible signature with deploy parameters
  return serializeErc6492Signature({
    address: SMART_ACCOUNT_FACTORY_ADDRESS,
    data: encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [
        salt,
        getInitializerCalldata(signer.account.address, EOA_VALIDATOR_ADDRESS, {
          target: zeroAddress,
          allowFailure: false,
          callData: '0x',
          value: 0n,
        }),
      ],
    }),
    signature,
  });
}
