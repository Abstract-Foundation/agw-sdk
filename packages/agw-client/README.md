# @abstract-foundation/agw-client

The `@abstract-foundation/agw-client` package provides the core client library for interacting with the [Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview).

## Abstract Global Wallet (AGW)

[Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview) is a cross-application [smart contract wallet](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets) that users can be used to interact with any application built on Abstract, powered by Abstract's [native account abstraction](https://docs.abs.xyz/how-abstract-works/native-account-abstraction).


## Installation

Install the core client library via NPM:

```bash
npm install @abstract-foundation/agw-client
```

## Quick Start

### Importing

```tsx
import { createAbstractClient } from '@abstract-foundation/agw-client'
```

### Creating an Abstract Client

```tsx
import { createAbstractClient } from '@abstract-foundation/agw-client';
import { ChainEIP712, http } from 'viem';
import { Account } from 'viem/accounts';

// Assume you have a signer account and chain configuration
const signer: Account = {
  address: '0xYourSignerAddress',
  // ...other account properties
};

(async () => {
  const abstractClient = await createAbstractClient({
    signer,
    chain,
    transport: http(), // optional, defaults to HTTP transport if omitted
  });

  // Use the abstractClient instance
})();
```

## API Reference

### `createAbstractClient`

Asynchronously creates an `AbstractClient` instance, extending the standard `Client` with actions specific to the Abstract Global Wallet.

### Example

```tsx
import { createAbstractClient } from '@abstract-foundation/agw-client';

(async () => {
  const abstractClient = await createAbstractClient({
    signer: /* your signer account */,
    chain: /* your chain configuration */,
  });

  // Use abstractClient to interact with the blockchain
})();
```

## Examples

### Sending a Transaction

```tsx
import { createAbstractClient } from '@abstract-foundation/agw-client';

(async () => {
  const abstractClient = await createAbstractClient({
    signer: /* your signer account */,
    chain: /* your chain configuration */,
  });

  try {
    const txHash = await abstractClient.sendTransaction({
      to: '0xRecipientAddress',
      value: 1000000000000000000n, // 1 ETH in wei
    });
    console.log('Transaction Hash:', txHash);
  } catch (error) {
    console.error('Error sending transaction:', error);
  }
})();
```

### Sponsored Transactions via Paymasters

```tsx
import { createAbstractClient } from '@abstract-foundation/agw-client';
import { ChainEIP712, http } from 'viem';
import { Account } from 'viem/accounts';

(async () => {
  // Create a signer account and chain configuration
  const signer: Account = {
    address: '0xYourSignerAddress',
    // ...other account properties
  };

  // Create an instance of Abstract Client
  const abstractClient = await createAbstractClient({
    signer,
    chain,
    transport: http(), // Optional, defaults to HTTP transport if omitted
  });

  // Example of a sponsored transaction using a Paymaster
  try {
    const txHash = await abstractClient.sendTransaction({
      to: '0xRecipientAddress',
      value: 1000000000000000000n, // 1 ETH in wei
      sponsor: {
        paymaster: '0xPaymasterAddress', // Address of the Paymaster contract
      },
    });

    console.log('Sponsored Transaction Hash:', txHash);
  } catch (error) {
    console.error('Error sending sponsored transaction:', error);
  }
})();

```

### Explanation of Paymaster Usage:

- **Paymaster**: The `paymaster` object is specified in the `sendTransaction` method, allowing the Paymaster contract to cover the gas fees for the transaction.
- **Sponsored Transaction**: The transaction fee is covered by the Paymaster, so the user’s balance is unaffected by gas costs.

## Documentation

For detailed documentation, please refer to the [Abstract Global Wallet Documentation](https://docs.abs.xyz/how-abstract-works/abstract-global-wallet/overview).