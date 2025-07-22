import { abstractWalletConnector } from './abstractWalletConnector.js';
import { ICON_URL } from './constants.js';
import { type Wallet } from './types/rainbowkit.js';

/**
 * Create a RainbowKit wallet for Abstract Global Wallet
 *
 * @example
 * import { connectorsForWallets } from "@rainbow-me/rainbowkit";
 * import { abstractWallet } from "@abstract-foundation/agw-react/connectors"
 *
 * const connectors = connectorsForWallets(
 *  [
 *    {
 *      groupName: "Abstract",
 *      wallets: [abstractWallet],
 *    },
 *  ]);
 */
const abstractWallet = (): Wallet => {
  return {
    id: 'abstract',
    name: 'Abstract',
    iconUrl: ICON_URL,
    iconBackground: '#ffffff',
    installed: true,
    shortName: 'Abstract',
    createConnector: (rkDetails) =>
      abstractWalletConnector({
        rkDetails,
      }),
  };
};

export { abstractWallet };
