import {
  type Address,
  assertCurrentChain,
  type Chain,
  createPublicClient,
  createWalletClient,
  custom,
  type CustomSource,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  fromHex,
  type Hex,
  hexToBigInt,
  hexToNumber,
  isHex,
  toHex,
  type Transport,
} from 'viem';
import { parseAccount, toAccount } from 'viem/accounts';

import { createAbstractClient } from './abstractClient.js';
import {
  agwCapabilitiesV2,
  getReceiptStatus,
  type SendCallsParams,
  type WalletCapabilities,
} from './eip5792.js';
import { type CustomPaymasterHandler, validChains } from './exports/index.js';
import { getSmartAccountAddressFromInitialSigner } from './utils.js';

interface TransformEIP1193ProviderOptions {
  provider: EIP1193Provider;
  chain: Chain;
  transport?: Transport;
  isPrivyCrossApp?: boolean;
  customPaymasterHandler?: CustomPaymasterHandler;
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

async function getAgwClient(
  account: Address,
  chain: Chain,
  transport: Transport,
  isPrivyCrossApp: boolean,
  overrideTransport: Transport | undefined,
  customPaymasterHandler: CustomPaymasterHandler | undefined,
) {
  const wallet = createWalletClient({
    account,
    transport,
  });

  const signer = toAccount({
    address: account,
    signMessage: wallet.signMessage,
    signTransaction: wallet.signTransaction as CustomSource['signTransaction'],
    signTypedData: wallet.signTypedData as CustomSource['signTypedData'],
  });

  const abstractClient = await createAbstractClient({
    chain,
    signer,
    transport,
    isPrivyCrossApp,
    publicTransport: overrideTransport,
    customPaymasterHandler,
  });

  return abstractClient;
}

export function transformEIP1193Provider(
  options: TransformEIP1193ProviderOptions,
): EIP1193Provider {
  const {
    provider,
    chain,
    transport: overrideTransport,
    isPrivyCrossApp = false,
    customPaymasterHandler,
  } = options;

  const transport = custom(provider);

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
        const account = await getAgwSigner(provider);
        if (!account) {
          throw new Error('Account not found');
        }
        if (params[0] === account) {
          return provider.request(e);
        }

        const abstractClient = await getAgwClient(
          account,
          chain,
          transport,
          isPrivyCrossApp,
          overrideTransport,
          customPaymasterHandler,
        );

        return abstractClient.signTypedData(JSON.parse(params[1]));
      }
      case 'personal_sign': {
        const account = await getAgwSigner(provider);
        if (!account) {
          throw new Error('Account not found');
        }
        if (params[1] === account) {
          return provider.request(e);
        }

        const abstractClient = await getAgwClient(
          account,
          chain,
          transport,
          isPrivyCrossApp,
          overrideTransport,
          customPaymasterHandler,
        );

        return await abstractClient.signMessage({
          message: {
            raw: params[0],
          },
        });
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

        const abstractClient = await getAgwClient(
          account,
          chain,
          transport,
          isPrivyCrossApp,
          overrideTransport,
          customPaymasterHandler,
        );

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
      case 'wallet_sendCalls': {
        const account = await getAgwSigner(provider);
        if (!account) {
          throw new Error('Account not found');
        }
        const sendCallsParams = params[0] as SendCallsParams;

        if (sendCallsParams.from === account) {
          return await provider.request(e);
        }

        if (
          sendCallsParams.version === '1.0' ||
          sendCallsParams.version === undefined
        ) {
          sendCallsParams.calls.forEach((call) => {
            if (call.chainId) {
              assertCurrentChain({
                chain,
                currentChainId: fromHex(call.chainId, 'number'),
              });
            }
          });
        }
        if (sendCallsParams.version === '2.0.0') {
          if (fromHex(sendCallsParams.chainId, 'number') !== chain.id) {
            return {
              code: 5710,
              message: 'Chain not supported',
            };
          }
        }

        const abstractClient = await getAgwClient(
          account,
          chain,
          transport,
          isPrivyCrossApp,
          overrideTransport,
          customPaymasterHandler,
        );

        if (
          sendCallsParams.from !== parseAccount(abstractClient.account).address
        ) {
          return {
            code: 4001,
            message: 'Unauthorized',
          };
        }

        const txHash = await abstractClient.sendTransactionBatch({
          calls: sendCallsParams.calls.map((call) => ({
            to: call.to,
            value: call.value ? hexToBigInt(call.value) : undefined,
            data: call.data,
          })),
        });

        if (
          sendCallsParams.version === undefined ||
          sendCallsParams.version === '1.0'
        ) {
          return txHash;
        }

        return {
          id: txHash,
        };
      }
      case 'wallet_getCallsStatus': {
        const receipt = await provider.request({
          method: 'eth_getTransactionReceipt',
          params,
        });
        return {
          version: '2.0.0',
          id: params[0],
          chainId: toHex(chain.id),
          status: getReceiptStatus(receipt ?? undefined),
          atomic: true, // AGW will always process multiple calls as an atomic batch
          receipts: receipt != null ? [receipt] : undefined,
        };
      }
      case 'wallet_addEthereumChain':
      case 'wallet_switchEthereumChain': {
        const request = params[0];
        const chainIdHex = request.chainId;
        if (!chainIdHex) {
          throw new Error('Chain ID is required');
        }
        // chainId is hex most likely, convert to number
        const chainId = isHex(chainIdHex)
          ? hexToNumber(chainIdHex)
          : chainIdHex;
        const chain = Object.values(validChains).find((c) => c.id === chainId);
        if (!chain) {
          throw new Error(`Chain ${chainId} not supported`);
        }
        return await provider.request(e);
      }
      case 'wallet_showCallsStatus': {
        // not implemented
        return undefined;
      }
      case 'wallet_getCapabilities': {
        const account = await getAgwSigner(provider);
        if (!account) {
          throw new Error('Account not found');
        }
        if (params[0] === account) {
          return await provider.request(e);
        }
        const chainIds = params[1] as Hex[] | undefined;

        const capabilities = agwCapabilitiesV2;
        if (chainIds) {
          const filteredCapabilities: WalletCapabilities = {};
          for (const chainId of chainIds) {
            if (capabilities[chainId]) {
              filteredCapabilities[chainId] = capabilities[chainId];
            }
          }
          return filteredCapabilities;
        } else {
          return capabilities;
        }
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
