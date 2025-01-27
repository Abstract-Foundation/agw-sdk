import {
  type CrossAppAccount,
  type SignTypedDataParams,
  useCrossAppAccounts,
  usePrivy,
  type User,
} from '@privy-io/react-auth';
import { useCallback, useMemo } from 'react';
import {
  type Address,
  type Chain,
  createPublicClient,
  type EIP1193Provider,
  type EIP1193RequestFn,
  type EIP1474Methods,
  fromHex,
  http,
  type RpcSchema,
  toHex,
  type Transport,
} from 'viem';

import { AGW_APP_ID } from '../constants.js';

interface PrivyUserWallets {
  signer?: Address | undefined;
  smartAccount?: Address | undefined;
}

type RpcMethodNames<rpcSchema extends RpcSchema> =
  rpcSchema[keyof rpcSchema] extends { Method: string }
    ? rpcSchema[keyof rpcSchema]['Method']
    : never;
type EIP1474MethodNames = RpcMethodNames<EIP1474Methods>;

interface UsePrivyCrossAppEIP1193Props {
  chain: Chain;
  transport?: Transport;
}

export const usePrivyCrossAppProvider = ({
  chain,
  transport = http(),
}: UsePrivyCrossAppEIP1193Props) => {
  const {
    loginWithCrossAppAccount,
    linkCrossAppAccount,
    sendTransaction,
    signMessage,
    signTypedData,
  } = useCrossAppAccounts();
  const { user, authenticated, ready: privyReady } = usePrivy();

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
    zks_estimateFee: true,
  };
  const passthrough = (method: EIP1474MethodNames) =>
    !!passthroughMethods[method];

  const publicClient = createPublicClient({
    chain,
    transport,
  });

  const getAddressesFromUser = (user: User | null): PrivyUserWallets => {
    if (!user) {
      return {
        smartAccount: undefined,
        signer: undefined,
      };
    }
    const crossAppAccount = user.linkedAccounts.find(
      (account) =>
        account.type === 'cross_app' && account.providerApp.id === AGW_APP_ID,
    ) as CrossAppAccount | undefined;

    const smartAccount = crossAppAccount?.smartWallets?.[0]?.address;
    const signer = crossAppAccount?.embeddedWallets?.[0]?.address;

    return {
      smartAccount: smartAccount ? (smartAccount as Address) : undefined,
      signer: signer ? (signer as Address) : undefined,
    };
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
      const { signer, smartAccount } = getAddressesFromUser(contextUser);
      if (signer && smartAccount) {
        return [smartAccount, signer];
      } else {
        return [];
      }
    },
    [
      user,
      authenticated,
      privyReady,
      loginWithCrossAppAccount,
      linkCrossAppAccount,
    ],
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
        case 'eth_signTransaction':
          throw new Error('eth_signTransaction is not supported');
        case 'eth_sendTransaction': {
          const transaction = params[0];
          // Undo the automatic formatting applied by Wagmi's eth_signTransaction
          // Formatter: https://github.com/wevm/viem/blob/main/src/zksync/formatters.ts#L114
          if (
            transaction.eip712Meta &&
            transaction.eip712Meta.paymasterParams
          ) {
            transaction.paymaster =
              transaction.eip712Meta.paymasterParams.paymaster;
            transaction.paymasterInput = toHex(
              transaction.eip712Meta.paymasterParams.paymasterInput,
            );
          }
          return await sendTransaction(
            {
              ...transaction,
              chainId: chain.id,
            },
            {
              address: transaction.from,
            },
          );
        }
        case 'eth_signTypedData_v4':
          return await signTypedData(
            JSON.parse(params[1]) as SignTypedDataParams,
            { address: params[0], chainId: chain.id },
          );
        case 'eth_sign':
          throw new Error('eth_sign is unsafe and not supported');
        case 'personal_sign': {
          return await signMessage(fromHex(params[0], 'string'), {
            address: params[1],
            chainId: chain.id,
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

  const ready = useMemo(() => {
    return (
      privyReady &&
      user &&
      authenticated &&
      user.linkedAccounts.some(
        (account) =>
          account.type === 'cross_app' && account.providerApp.id === AGW_APP_ID,
      )
    );
  }, [privyReady, user, authenticated]);

  return {
    ready,
    provider,
  };
};
