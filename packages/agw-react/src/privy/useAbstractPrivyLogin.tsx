import { useCrossAppAccounts } from '@privy-io/react-auth';

import { AGW_APP_ID } from '../constants.js';

export const useAbstractPrivyLogin = () => {
  const { loginWithCrossAppAccount, linkCrossAppAccount } =
    useCrossAppAccounts();

  return {
    login: () => loginWithCrossAppAccount({ appId: AGW_APP_ID }),
    link: () => linkCrossAppAccount({ appId: AGW_APP_ID }),
  };
};
