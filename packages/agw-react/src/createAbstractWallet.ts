'use client';
import { type Wallet } from '@rainbow-me/rainbowkit';

import { createAbstractWalletConnector } from './createAbstractWalletConnector.js';

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
export const abstractWallet = ({
  theme,
}: {
  theme?: 'light' | 'dark';
}): Wallet => {
  const { iconUrl, iconBackground } =
    theme === 'light'
      ? {
          iconUrl:
            'https://ipfs.io/ipfs/QmSpL14zz76qGCvxD5rd3SLTmQUmruY3DEZAw3a9GebZ4S',
          iconBackground: '#ffffff',
        }
      : {
          iconUrl:
            'https://ipfs.io/ipfs/QmbY72KMVHBdHr13hmZayoWZPg5TYKiuFBtSUVXtGMaeEd',
          iconBackground: '#000000',
        };

  return {
    id: 'abs-xyz',
    name: 'Abstract',
    iconUrl,
    iconBackground,
    installed: true,
    shortName: 'Abstract',
    createConnector: () => {
      return createAbstractWalletConnector();
    },
  };
};
