import {
  type Config,
  type ResolvedRegister,
  useAccount,
  type UseAccountParameters,
  type UseAccountReturnType,
} from 'wagmi';

/**
 * React hook to get the approved signer of the connected Abstract Global Wallet.
 *
 * This hook retrieves the account (EOA) that is approved to sign transactions
 * for the Abstract Global Wallet smart contract. It's useful when you need to access
 * the underlying EOA that signs transactions for the Abstract wallet, i.e. the Privy signer.
 *
 * Under the hood, this hook uses wagmi's `useAccount` and extracts the second address
 * (index 1) from the addresses array, which corresponds to the approved signer account.
 *
 * Note: If you need to get the address of the AGW smart contract itself (not the underlying approved signer),
 * you should use the standard `useAccount` hook from wagmi instead.
 *
 * @param parameters - Parameters to pass to the underlying wagmi useAccount hook
 * @returns Standard wagmi account object with the address set to the approved signer address
 *
 * @example
 * ```tsx
 * import { useGlobalWalletSignerAccount } from "@abstract-foundation/agw-react";
 *
 * export default function App() {
 *   const { address, status, isConnected } = useGlobalWalletSignerAccount();
 *
 *   if (status === "disconnected") {
 *     return <div>Disconnected</div>;
 *   }
 *
 *   if (status === "connecting" || status === "reconnecting") {
 *     return <div>Connecting...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Connected Signer EOA: {address}</p>
 *       <p>Connection Status: {status}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useGlobalWalletSignerAccount](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useGlobalWalletSignerAccount)
 *
 * @see {@link useAccount} - The underlying wagmi hook
 */
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
