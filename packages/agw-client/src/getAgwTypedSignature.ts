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
import { signTypedData } from 'viem/actions';
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
      ClaveMessage: [{ name: 'signedHash', type: 'bytes32' }],
    },
    message: {
      signedHash: messageHash,
    },
    primaryType: 'ClaveMessage',
  });

  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address']),
    [rawSignature, EOA_VALIDATOR_ADDRESS],
  );

  const addressBytes = toBytes(signer.account.address);
  const salt = keccak256(addressBytes);
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
