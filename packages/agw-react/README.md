# @abstract-foundation/agw-react

The `@abstract-foundation/agw-react` package provides React hooks and components to integrate the [Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview) into your React applications.

## Abstract Global Wallet (AGW)

[Abstract Global Wallet (AGW)](https://docs.abs.xyz/overview) is a cross-application [smart contract wallet](https://docs.abs.xyz/how-abstract-works/native-account-abstraction/smart-contract-wallets) that users can be used to interact with any application built on Abstract, powered by Abstract's [native account abstraction](https://docs.abs.xyz/how-abstract-works/native-account-abstraction).


## Installation

Install the React integration package via NPM:

```bash
npm install @abstract-foundation/agw-react
```

## Quick Start

### Importing

```tsx
import { useAbstractClient, useLoginWithAbstract } from '@abstract-foundation/agw-react';
```

### Using `useLoginWithAbstract` Hook

```tsx
import React from 'react';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';

export default function App() {
  const { login, logout } = useLoginWithAbstract();

  return (
    <div>
      <button onClick={login}>Connect with Abstract</button>
      <button onClick={logout}>Disconnect</button>
    </div>
  );
}
```

### Using `useAbstractClient` Hook

```tsx
import React from 'react';
import { useAbstractClient } from '@abstract-foundation/agw-react';

export default function App() {
  const { data: abstractClient, error, isLoading } = useAbstractClient();

  if (isLoading) return <div>Loading Abstract Client...</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Use the abstractClient instance here
  return <div>Abstract Client is ready!</div>;
}
```

## API Reference

- **`useAbstractClient`**: Hook to create and access an instance of the Abstract Client within your React application.
- **`useLoginWithAbstract`**: Hook for signing in and signing out users with the Abstract Global Wallet.
- **`useGlobalWalletSignerAccount`**: Hook to retrieve the Global Wallet Signer's account information.
- **`useGlobalWalletSignerClient`**: Hook to access the wallet client associated with the Global Wallet Signer's account.
- **`useWriteContractSponsored`**: Hook to perform sponsored contract write operations.

## Examples

### Sending a Transaction

Using `@abstract-foundation/agw-react` to send a transaction:

```tsx
import React from 'react';
import { useAbstractClient } from '@abstract-foundation/agw-react';

export default function SendTransactionButton() {
  const { data: abstractClient } = useAbstractClient();

  const handleSendTransaction = async () => {
    if (!abstractClient) return;

    try {
      const txHash = await abstractClient.sendTransaction({
        to: '0xRecipientAddress',
        value: 1000000000000000000n, // 1 ETH in wei
      });
      console.log('Transaction Hash:', txHash);
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  return (
    <button onClick={handleSendTransaction} disabled={!abstractClient}>
      Send Transaction
    </button>
  );
}
```

### Using `useWriteContractSponsored`

```tsx
import React from 'react';
import { useWriteContractSponsored } from '@abstract-foundation/agw-react';
import { Abi } from 'viem';

const contractAbi: Abi = [/* Your contract ABI here */];

export default function SponsoredContractWrite() {
  const {
    writeContractSponsored,
    data,
    error,
    isLoading,
    isSuccess,
  } = useWriteContractSponsored();

  const handleWriteContract = () => {
    writeContractSponsored({
      address: '0xYourContractAddress',
      abi: contractAbi,
      functionName: 'yourFunctionName',
      args: ['arg1', 'arg2'],
    });
  };

  return (
    <div>
      <button onClick={handleWriteContract} disabled={isLoading}>
        {isLoading ? 'Processing...' : 'Execute Sponsored Transaction'}
      </button>
      {isSuccess && <div>Transaction Hash: {data?.hash}</div>}
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Documentation

For detailed documentation, please refer to the [Abstract Global Wallet Documentation](https://docs.abs.xyz/how-abstract-works/abstract-global-wallet/overview).