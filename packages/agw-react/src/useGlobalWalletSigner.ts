import {
  type Config,
  type ResolvedRegister,
  useAccount,
  type UseAccountParameters,
  type UseAccountReturnType,
  useWalletClient,
  type UseWalletClientParameters,
  type UseWalletClientReturnType,
} from 'wagmi';
import type { GetWalletClientData } from 'wagmi/query';

export function useGlobalWalletSignerAccount<
  config extends Config = ResolvedRegister['config'],
>(parameters: UseAccountParameters<config> = {}): UseAccountReturnType<config> {
  const account = useAccount(parameters);

  if (!account.addresses?.[1]) {
    return {
      address: undefined,
      addresses: undefined,
      chain: undefined,
      chainId: undefined,
      connector: undefined,
      isConnected: false,
      isReconnecting: false,
      isConnecting: false,
      isDisconnected: true,
      status: 'disconnected',
    };
  }

  return {
    ...account,
    address: account.addresses?.[1],
  };
}

export function useGlobalWalletSignerClient<
  config extends Config = ResolvedRegister['config'],
  chainId extends
    config['chains'][number]['id'] = config['chains'][number]['id'],
  selectData = GetWalletClientData<config, chainId>,
>(
  parameters: UseWalletClientParameters<config, chainId, selectData> = {},
): UseWalletClientReturnType<config, chainId, selectData> {
  const { address } = useGlobalWalletSignerAccount();

  const walletClient = useWalletClient({
    ...parameters,
    account: address,
  });

  return walletClient;
}
