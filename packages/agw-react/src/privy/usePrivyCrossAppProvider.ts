import { transformEIP1193Provider } from '@abstract-foundation/agw-client';
import {
  type CrossAppAccount,
  type SignTypedDataParams,
  useCrossAppAccounts,
  usePrivy,
  type User,
} from '@privy-io/react-auth';
import { randomBytes } from 'crypto';
import { useCallback, useMemo } from 'react';
import {
  type Address,
  createPublicClient,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  fromHex,
  http,
  type RpcSchema,
  type Transport,
} from 'viem';
import { abstractTestnet } from 'viem/chains';

import { AGW_APP_ID } from '../constants.js';

type RpcMethodNames<rpcSchema extends RpcSchema> =
  rpcSchema[keyof rpcSchema] extends { Method: string }
    ? rpcSchema[keyof rpcSchema]['Method']
    : never;
type EIP1474MethodNames = RpcMethodNames<EIP1474Methods>;

interface UsePrivyCrossAppEIP1193Props {
  testnet?: boolean;
  transport?: Transport;
}

export const usePrivyCrossAppProvider = ({
  testnet = false,
  transport = http(),
}: UsePrivyCrossAppEIP1193Props) => {
  const chain = testnet ? abstractTestnet : abstractTestnet;

  const {
    loginWithCrossAppAccount,
    linkCrossAppAccount,
    // sendTransaction, TBD
    signMessage,
    signTypedData,
  } = useCrossAppAccounts();
  const { user, authenticated, ready } = usePrivy();

  const passthroughMethods = {
    web3_clientVersion: true,
    web3_sha3: true,
    net_listening: true,
    net_peerCount: true,
    net_version: true,
    eth_blobBaseFee: true,
    eth_blockNumber: true,
    eth_call: true,
    eth_chainId: true,
    eth_coinbase: true,
    eth_estimateGas: true,
    eth_feeHistory: true,
    eth_gasPrice: true,
    eth_getBalance: true,
    eth_getBlockByHash: true,
    eth_getBlockByNumber: true,
    eth_getBlockTransactionCountByHash: true,
    eth_getBlockTransactionCountByNumber: true,
    eth_getCode: true,
    eth_getFilterChanges: true,
    eth_getFilterLogs: true,
    eth_getLogs: true,
    eth_getProof: true,
    eth_getStorageAt: true,
    eth_getTransactionByBlockHashAndIndex: true,
    eth_getTransactionByBlockNumberAndIndex: true,
    eth_getTransactionByHash: true,
    eth_getTransactionCount: true,
    eth_getTransactionReceipt: true,
    eth_getUncleByBlockHashAndIndex: true,
    eth_getUncleByBlockNumberAndIndex: true,
    eth_getUncleCountByBlockHash: true,
    eth_getUncleCountByBlockNumber: true,
    eth_maxPriorityFeePerGas: true,
    eth_newBlockFilter: true,
    eth_newFilter: true,
    eth_newPendingTransactionFilter: true,
    eth_protocolVersion: true,
    eth_sendRawTransaction: true,
    eth_uninstallFilter: true,
  };
  const passthrough = (method: EIP1474MethodNames) =>
    !!passthroughMethods[method];

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const getAddressFromUser = (user: User | null): Address | undefined => {
    if (!user) {
      return undefined;
    }
    const crossAppAccount = user.linkedAccounts.find(
      (account) =>
        account.type === 'cross_app' && account.providerApp.id === AGW_APP_ID,
    ) as CrossAppAccount | undefined;

    const address = crossAppAccount?.embeddedWallets?.[0]?.address;
    return address ? (address as Address) : undefined;
  };

  const getAccounts = useCallback(
    async (promptLogin: boolean) => {
      if (!ready) {
        return [];
      }
      let contextUser = user;
      if (promptLogin) {
        if (!contextUser && !authenticated) {
          contextUser = await loginWithCrossAppAccount({
            appId: AGW_APP_ID,
          });
        } else if (!contextUser && authenticated) {
          contextUser = await linkCrossAppAccount({ appId: AGW_APP_ID });
        }
      }
      const address = getAddressFromUser(contextUser);
      return address ? [address] : [];
    },
    [user, authenticated, ready, loginWithCrossAppAccount, linkCrossAppAccount],
  );

  const eventListeners = new Map<string, ((...args: any[]) => void)[]>();

  const handleRequest = useCallback(
    async (request: any) => {
      const { method, params } = request;
      if (passthrough(method as EIP1474MethodNames)) {
        return publicClient.request(request);
      }

      switch (method) {
        case 'eth_requestAccounts': {
          return await getAccounts(true);
        }
        case 'eth_accounts': {
          return await getAccounts(false);
        }
        case 'wallet_switchEthereumChain':
          // TODO: do we need to do anything here?
          return null;
        case 'wallet_revokePermissions':
          // TODO: do we need to do anything here?
          return null;
        case 'eth_sendTransaction':
        case 'eth_signTransaction':
          // TODO: Implement
          return randomBytes(32).toString('hex'); // fake tx hash
        case 'eth_signTypedData_v4':
          return await signTypedData(
            JSON.parse(params[1]) as SignTypedDataParams,
            { address: params[0] },
          );
        case 'eth_sign':
          throw new Error('eth_sign is unsafe and not supported');
        case 'personal_sign': {
          return await signMessage(fromHex(params[0], 'string'), {
            address: params[1],
          });
        }
        default:
          throw new Error(`Unsupported request: ${method}`);
      }
    },
    [passthrough, publicClient, getAccounts, signMessage],
  );

  const provider: EIP1193Provider = useMemo(() => {
    return {
      on: (event, listener) => {
        eventListeners.set(event, [
          ...(eventListeners.get(event) ?? []),
          listener,
        ]);
      },
      removeListener: (event, listener) => {
        eventListeners.set(
          event,
          (eventListeners.get(event) ?? []).filter((l) => l !== listener),
        );
      },
      request: handleRequest as EIP1193RequestFn<EIP1474Methods>,
    };
  }, [handleRequest]);

  const wrappedProvider = transformEIP1193Provider({
    chain,
    provider,
    transport,
  });

  return {
    ready,
    provider: wrappedProvider,
  };
};
