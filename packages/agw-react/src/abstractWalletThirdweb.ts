import { validChains } from '@abstract-foundation/agw-client';
import { createEmitter } from '@wagmi/core/internal';
import { EIP1193, type Wallet } from 'thirdweb/wallets';
import type { Chain } from 'viem/chains';

import { abstractWalletConnector } from './abstractWalletConnector.js';

/**
 * Create a thirdweb wallet for Abstract Global Wallet
 *
 * @returns A wallet instance wrapping Abstract Global Wallet to be used with the thirdweb Connect SDK
 *
 * @example
 * ```tsx
 * import { createThirdwebClient } from "thirdweb";
 * import { abstractWallet } from "@abstract-foundation/agw-react/thirdweb"
 *
 * const client = createThirdwebClient({ clientId });
 *
 * <ConnectButton client={client} wallets=[abstractWallet()]>
 * ```
 */
const abstractWallet = (): Wallet => {
  const connector = abstractWalletConnector()({
    chains: Object.values(validChains) as [Chain, ...Chain[]],
    emitter: createEmitter('xyz.abs'),
  });
  return EIP1193.fromProvider({
    provider: connector.getProvider,
    walletId: 'xyz.abs',
  });
};

export { abstractWallet };
