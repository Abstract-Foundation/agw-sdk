import { useCallback } from 'react';
import { useConnect, useDisconnect } from 'wagmi';

interface AbstractLogin {
  login: () => void;
  logout: () => void;
}

/**
 * React hook for signing in and signing out users with Abstract Global Wallet.
 *
 * This hook provides utility functions to prompt users to sign up or sign into your
 * application using Abstract Global Wallet, and to sign out once connected.
 *
 * Under the hood, it uses the following wagmi hooks:
 * - `login`: Uses wagmi's `useConnect` hook to connect to the Abstract connector
 * - `logout`: Uses wagmi's `useDisconnect` hook to disconnect the user
 *
 * @returns An object containing login and logout functions
 * @returns {function} login - Opens the signup/login modal for Abstract Global Wallet
 * @returns {function} logout - Disconnects the user's wallet from the application
 *
 * @example
 * ```tsx
 * import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
 * import { useAccount } from "wagmi";
 *
 * export default function LoginComponent() {
 *   const { login, logout } = useLoginWithAbstract();
 *   const { isConnected } = useAccount();
 *
 *   return (
 *     <div>
 *       {isConnected ? (
 *         <button onClick={logout}>
 *           Disconnect Abstract Wallet
 *         </button>
 *       ) : (
 *         <button onClick={login}>
 *           Login with Abstract
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * If the user doesn't have an Abstract Global Wallet, they will be prompted to create one.
 * If they already have a wallet, they'll be prompted to use it to sign in.
 *
 * Read more: [Abstract docs: useLoginWithAbstract](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useLoginWithAbstract)
 *
 * @see {@link useConnect} - The underlying wagmi connect hook
 * @see {@link useDisconnect} - The underlying wagmi disconnect hook
 */
export const useLoginWithAbstract = (): AbstractLogin => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const login = useCallback(() => {
    const connector = connectors.find((c) => c.id === 'xyz.abs.privy');
    if (!connector) {
      throw new Error('Abstract connector not found');
    }
    connect({ connector });
  }, [connect, connectors]);

  const logout = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    login,
    logout,
  };
};
