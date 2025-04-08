import {
  type Config,
  type ResolvedRegister,
  useWalletClient,
  type UseWalletClientParameters,
  type UseWalletClientReturnType,
} from 'wagmi';
import type { GetWalletClientData } from 'wagmi/query';

import { useGlobalWalletSignerAccount } from './useGlobalWalletSignerAccount.js';

/**
 * React hook to get a wallet client instance of the approved signer of the connected Abstract Global Wallet.
 *
 * This hook returns a wallet client instance that can perform actions from the underlying EOA
 * (externally owned account) approved to sign transactions for the Abstract Global Wallet smart contract.
 *
 * Important: This hook is different from `useAbstractClient`, which performs actions from the
 * Abstract Global Wallet smart contract itself. This hook accesses the underlying EOA signer.
 *
 * Under the hood, it uses wagmi's `useWalletClient` hook, setting the account to the EOA
 * retrieved from `useGlobalWalletSignerAccount`.
 *
 * @param parameters - Optional parameters to pass to the underlying wagmi useWalletClient hook
 * @returns A query result containing the wallet client when successfully created
 *
 * @example
 * ```tsx
 * import { useGlobalWalletSignerClient } from "@abstract-foundation/agw-react";
 *
 * function SignerComponent() {
 *   const { data: client, isLoading, error } = useGlobalWalletSignerClient();
 *
 *   // Send a transaction directly from the EOA signer
 *   const handleSendTransaction = async () => {
 *     if (!client) return;
 *
 *     try {
 *       const hash = await client.sendTransaction({
 *         to: '0x8e729E23CDc8bC21c37a73DA4bA9ebdddA3C8B6d',
 *         data: '0x69',
 *         value: BigInt(0)
 *       });
 *       console.log('Transaction sent:', hash);
 *     } catch (err) {
 *       console.error('Transaction failed:', err);
 *     }
 *   };
 *
 *   if (isLoading) return <div>Loading signer...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   if (!client) return <div>No signer available</div>;
 *
 *   return (
 *     <div>
 *       <button onClick={handleSendTransaction}>Send Transaction</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useGlobalWalletSignerClient](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useGlobalWalletSignerClient)
 *
 * @see {@link useWalletClient} - The underlying wagmi hook
 * @see {@link useGlobalWalletSignerAccount} - Hook to get the approved signer account
 * @see {@link useAbstractClient} - Hook to get a client for the Abstract Global Wallet smart contract
 */
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
