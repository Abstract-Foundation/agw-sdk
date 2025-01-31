import { type WalletConnectorConstructor } from '@dynamic-labs/wallet-connector-core';

import { AbstractEvmWalletConnector } from './AbstractEvmWalletConnector.js';

export const AbstractEvmWalletConnectors = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _props: any,
): WalletConnectorConstructor[] => [AbstractEvmWalletConnector];
