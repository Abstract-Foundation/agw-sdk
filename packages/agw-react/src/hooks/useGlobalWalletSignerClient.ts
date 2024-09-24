import {
  type Config,
  type ResolvedRegister,
  useWalletClient,
  type UseWalletClientParameters,
  type UseWalletClientReturnType,
} from 'wagmi';
import type { GetWalletClientData } from 'wagmi/query';

import { useGlobalWalletSignerAccount } from './useGlobalWalletSignerAccount.js';

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
