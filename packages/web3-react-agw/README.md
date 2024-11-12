# @abstract-foundation/web3-react-agw

The `@abstract-foundation/web3-react-agw` package implements a [web3-react](https://github.com/Uniswap/web3-react) connector for [Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview).

## Abstract Global Wallet (AGW)

[Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview) is a cross-application [smart contract wallet](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets) that users can be used to interact with any application built on Abstract, powered by Abstract's [native account abstraction](https://docs.abs.xyz/how-abstract-works/native-account-abstraction).

## Installation

Install the connector via NPM:

```bash
npm install @abstract-foundation/web3-react-agw
```

## Quick Start

### Importing

```tsx
import { AbstractGlobalWallet } from '@abstract-foundation/web3-react-agw';
```

### Initializing the connector

```tsx
// connector.tsx
import { initializeConnector } from '@web3-react/core';
import { AbstractGlobalWallet } from '@abstract-foundation/web3-react-agw';

export const [agw, hooks] = initializeConnector<AbstractGlobalWallet>(
  (actions) => new AbstractGlobalWallet({ actions }),
);
```

### Using the connector

```tsx
import React from 'react';
import { agw, hooks } from './connector';

const { useIsActive } = hooks;

export default function App() {
  const isActive = useIsActive();
  useEffect(() => {
    void agw.connectEagerly().catch(() => {
      console.debug('Failed to connect eagerly to agw');
    });
  }, []);

  const login = () => {
    void agw.activate();
  };

  const logout = () => {
    void agw.deactivate();
  };

  return (
    <div>
      {isActive ? (
        <button onClick={logout}>Disconnect</button>
      ) : (
        <button onClick={login}>Sign in with Abstract</button>
      )}
    </div>
  );
}
```

## API Reference

### `AbstractGlobalWallet`

Creates an `AbstractGlobalWallet` connector, extending the web3-react `Connector` to support the Abstract Global Wallet.

## Documentation

For detailed documentation, please refer to the [Abstract Global Wallet Documentation](https://docs.abs.xyz/how-abstract-works/abstract-global-wallet/overview).
