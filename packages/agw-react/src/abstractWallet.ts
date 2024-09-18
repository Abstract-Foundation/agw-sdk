'use client';
import { type Wallet } from '@rainbow-me/rainbowkit';

import { abstractWalletConnector } from './abstractWalletConnector.js';

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
    iconUrl:
      'https://ipfs.io/ipfs/QmSpL14zz76qGCvxD5rd3SLTmQUmruY3DEZAw3a9GebZ4S',
    iconBackground: '#ffffff',
    installed: true,
    shortName: 'Abstract',
    createConnector: (rkDetails) => abstractWalletConnector(rkDetails),
  };
};

export { abstractWallet };
