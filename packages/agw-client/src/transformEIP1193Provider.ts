import {
  type Address,
  assertCurrentChain,
  type Capabilities,
  type Chain,
  type ChainIdToCapabilities,
  type CustomSource,
  createPublicClient,
  createWalletClient,
  custom,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  fromHex,
  type Hex,
  hexToBigInt,
  hexToNumber,
  isHex,
  type Transport,
  toHex,
} from 'viem';
import { parseAccount, toAccount } from 'viem/accounts';

import { createAbstractClient } from './clients/abstractClient.js';
import {
  agwCapabilities,
  getReceiptStatus,
  type SendCallsParams,
} from './eip5792.js';
import { type CustomPaymasterHandler, validChains } from './exports/index.js';
import {
  getSmartAccountAddressFromInitialSigner,
  VALID_CHAINS,
} from './utils.js';

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

        const calls: {
          to: Address;
          value: bigint;
          data: Hex;
        }[] = [];

        for (const call of sendCallsParams.calls) {
          if (!call.to) {
            return {
              code: -32602,
              message: 'Invalid call to unspecified address',
            };
          }

          calls.push({
            to: call.to,
            value: call.value ? hexToBigInt(call.value) : 0n,
            data: call.data ?? '0x',
          });
        }

        const txHash = await abstractClient.sendTransactionBatch({
          calls,
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

        if (chainIds) {
          const filteredCapabilities: Capabilities = {};
          for (const chainId of chainIds) {
            if (VALID_CHAINS[fromHex(chainId, 'number')]) {
              filteredCapabilities[chainId] = agwCapabilities;
            }
          }
          return filteredCapabilities;
        } else {
          return Object.keys(VALID_CHAINS).reduce((acc, chainId) => {
            acc[toHex(Number(chainId))] = agwCapabilities;
            return acc;
          }, {} as ChainIdToCapabilities);
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
