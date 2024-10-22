import {
  type Address,
  type Chain,
  createPublicClient,
  createWalletClient,
  custom,
  type CustomSource,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  encodeAbiParameters,
  encodeFunctionData,
  fromHex,
  type Hash,
  hashMessage,
  hashTypedData,
  type Hex,
  keccak256,
  parseAbiParameters,
  serializeErc6492Signature,
  serializeTypedData,
  toBytes,
  toHex,
  type Transport,
  zeroAddress,
} from 'viem';
import { toAccount } from 'viem/accounts';

import AccountFactoryAbi from './abis/AccountFactory.js';
import { createAbstractClient } from './abstractClient.js';
import {
  SMART_ACCOUNT_FACTORY_ADDRESS,
  VALIDATOR_ADDRESS,
} from './constants.js';
import {
  getInitializerCalldata,
  getSmartAccountAddressFromInitialSigner,
} from './utils.js';

interface TransformEIP1193ProviderOptions {
  provider: EIP1193Provider;
  chain: Chain;
  transport?: Transport;
}

async function getAgwAddressFromInitialSigner(
  chain: Chain,
  transport: Transport,
  signer: Address,
) {
  const publicClient = createPublicClient({
    chain,
    transport,
  });

  return await getSmartAccountAddressFromInitialSigner(signer, publicClient);
}

async function getAgwSigner(
  provider: EIP1193Provider,
  method: 'eth_requestAccounts' | 'eth_accounts' = 'eth_accounts',
): Promise<Address | undefined> {
  const accounts = await provider.request({ method });
  return accounts?.[0];
}

async function getAgwTypedSignature(
  provider: EIP1193Provider,
  account: Address,
  signer: Address,
  messageHash: Hash,
): Promise<Hex> {
  const chainId = await provider.request({ method: 'eth_chainId' });

  const typedData = serializeTypedData({
    domain: {
      name: 'AbstractGlobalWallet',
      version: '1.0.0',
      chainId: fromHex(chainId, 'bigint'),
      verifyingContract: account,
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

  const rawSignature = await provider.request({
    method: 'eth_signTypedData_v4',
    params: [signer, typedData],
  });

  const signature = encodeAbiParameters(
    parseAbiParameters(['bytes', 'address']),
    [rawSignature, VALIDATOR_ADDRESS],
  );

  const addressBytes = toBytes(signer);
  const salt = keccak256(addressBytes);
  return serializeErc6492Signature({
    address: SMART_ACCOUNT_FACTORY_ADDRESS,
    data: encodeFunctionData({
      abi: AccountFactoryAbi,
      functionName: 'deployAccount',
      args: [
        salt,
        getInitializerCalldata(signer, VALIDATOR_ADDRESS, {
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

export function transformEIP1193Provider(
  options: TransformEIP1193ProviderOptions,
): EIP1193Provider {
  const { provider, chain, transport: overrideTransport } = options;

  const transport = overrideTransport ?? custom(provider);

  const handler: EIP1193RequestFn<EIP1474Methods> = async (e: any) => {
    const { method, params } = e;

    switch (method) {
      case 'eth_requestAccounts': {
        const signer = await getAgwSigner(provider, method);
        if (!signer) {
          return [];
        }

        const smartAccount = await getAgwAddressFromInitialSigner(
          chain,
          transport,
          signer,
        );

        return [smartAccount, signer];
      }
      case 'eth_accounts': {
        const signer = await getAgwSigner(provider);
        if (!signer) {
          return [];
        }

        const smartAccount = await getAgwAddressFromInitialSigner(
          chain,
          transport,
          signer,
        );

        return [smartAccount, signer];
      }
      case 'eth_signTypedData_v4': {
        const signer = await getAgwSigner(provider);
        if (!signer) {
          throw new Error('Account not found');
        }
        if (params[0] === signer) {
          return provider.request(e);
        }
        return await getAgwTypedSignature(
          provider,
          params[0],
          signer,
          hashTypedData(JSON.parse(params[1])),
        );
      }
      case 'personal_sign': {
        const signer = await getAgwSigner(provider);
        if (!signer) {
          throw new Error('Account not found');
        }
        if (params[1] === signer) {
          return provider.request(e);
        }
        return await getAgwTypedSignature(
          provider,
          params[1],
          signer,
          hashMessage({
            raw: params[0],
          }),
        );
      }
      case 'eth_signTransaction':
      case 'eth_sendTransaction': {
        const account = await getAgwSigner(provider);
        if (!account) {
          throw new Error('Account not found');
        }
        const transaction = params[0];

        if (transaction.from === account) {
          return await provider.request(e);
        }

        const wallet = createWalletClient({
          account,
          transport,
        });

        const signer = toAccount({
          address: account,
          signMessage: wallet.signMessage,
          signTransaction:
            wallet.signTransaction as CustomSource['signTransaction'],
          signTypedData: wallet.signTypedData as CustomSource['signTypedData'],
        });

        const abstractClient = await createAbstractClient({
          chain,
          signer,
          transport,
        });

        // Undo the automatic formatting applied by Wagmi's eth_signTransaction
        // Formatter: https://github.com/wevm/viem/blob/main/src/zksync/formatters.ts#L114
        if (transaction.eip712Meta && transaction.eip712Meta.paymasterParams) {
          transaction.paymaster =
            transaction.eip712Meta.paymasterParams.paymaster;
          transaction.paymasterInput = toHex(
            transaction.eip712Meta.paymasterParams.paymasterInput,
          );
        }

        if (method === 'eth_signTransaction') {
          return (await abstractClient.signTransaction(transaction)) as any;
        } else if (method === 'eth_sendTransaction') {
          return await abstractClient.sendTransaction(transaction);
        }
        throw new Error('Should not have reached this point');
      }
      default: {
        return await provider.request(e);
      }
    }
  };

  return {
    ...provider,
    on: provider.on,
    removeListener: provider.removeListener,
    request: handler,
  };
}
