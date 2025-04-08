import { useCrossAppAccounts } from '@privy-io/react-auth';

import { AGW_APP_ID } from '../constants.js';

/**
 * React hook for authenticating users with Abstract Global Wallet via Privy.
 *
 * This hook provides utility functions to prompt users to sign in with Abstract Global Wallet
 * or link their existing authenticated Privy account to an Abstract Global Wallet.
 *
 * Under the hood, it uses Privy's `useCrossAppAccounts` hook to connect to Abstract Global Wallet's
 * authentication system.
 *
 * @returns An object containing login and linking functions
 * @returns {function} login - Prompts users to authenticate with their Abstract Global Wallet
 * @returns {function} link - Allows authenticated users to link their account to an Abstract Global Wallet
 *
 * @example
 * ```tsx
 * import { useAbstractPrivyLogin } from "@abstract-foundation/agw-react/privy";
 *
 * function LoginButton() {
 *   const { login, link } = useAbstractPrivyLogin();
 *
 *   return (
 *     <div>
 *       <button onClick={login}>
 *         Login with Abstract
 *       </button>
 *
 *       <button onClick={link}>
 *         Link to Abstract Wallet
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * The `login` function uses Privy's `loginWithCrossAppAccount` to authenticate users with
 * their Abstract Global Wallet account.
 *
 * The `link` function uses Privy's `linkCrossAppAccount` to allow already authenticated
 * users to link their existing account to an Abstract Global Wallet.
 *
 * @see {@link useCrossAppAccounts} - The underlying Privy hook
 * @see {@link AbstractPrivyProvider} - Provider component required to use this hook
 */
export const useAbstractPrivyLogin = () => {
  const { loginWithCrossAppAccount, linkCrossAppAccount } =
    useCrossAppAccounts();

  return {
    login: () => loginWithCrossAppAccount({ appId: AGW_APP_ID }),
    link: () => linkCrossAppAccount({ appId: AGW_APP_ID }),
  };
};
