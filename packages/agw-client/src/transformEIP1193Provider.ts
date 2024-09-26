import {
  type Chain,
  createPublicClient,
  createWalletClient,
  custom,
  type CustomSource,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  toHex,
  type Transport,
} from 'viem';
import { toAccount } from 'viem/accounts';

import { createAbstractClient } from './abstractClient.js';
import { getSmartAccountAddressFromInitialSigner } from './utils.js';

interface TransformEIP1193ProviderOptions {
  provider: EIP1193Provider;
  chain: Chain;
  transport?: Transport;
}

export function transformEIP1193Provider(
  options: TransformEIP1193ProviderOptions,
): EIP1193Provider {
  const { provider, chain, transport: overrideTransport } = options;

  const providerHandleRequest = provider.request;
  const transport = overrideTransport ?? custom(provider);

  const handler: EIP1193RequestFn<EIP1474Methods> = async (e: any) => {
    const { method, params } = e;

    switch (method) {
      case 'eth_accounts': {
        const accounts = await provider.request({ method: 'eth_accounts' });
        const publicClient = createPublicClient({
          chain,
          transport,
        });

        if (accounts?.[0] === undefined) {
          return [];
        }
        const smartAccount = await getSmartAccountAddressFromInitialSigner(
          accounts[0],
          publicClient,
        );
        return [smartAccount, accounts[0]];
      }
      case 'eth_signTransaction':
      case 'eth_sendTransaction': {
        const accounts = await provider.request({ method: 'eth_accounts' });
        const account = accounts[0];
        if (!account) {
          throw new Error('Account not found');
        }
        const transaction = params[0];

        if (transaction.from === account) {
          return await providerHandleRequest(e);
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
        return await providerHandleRequest(e);
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
