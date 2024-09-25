import {
  type Config,
  type ResolvedRegister,
  useAccount,
  type UseAccountParameters,
  type UseAccountReturnType,
} from 'wagmi';

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
    address: account.addresses[1],
  };
}
