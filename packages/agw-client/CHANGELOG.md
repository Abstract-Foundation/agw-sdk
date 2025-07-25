# @abstract-foundation/agw-client

## 1.8.7

### Patch Changes

- b184c83: expose legacy atomicBatch capability for consumers using old version of EIP5792
- 690eb46: fix typing on AbstractWalletActions.getLinkedAccounts

## 1.8.6

### Patch Changes

- d892fbc: feat: Add optional nonce manager param when creating session client

## 1.8.5

### Patch Changes

- 47ad545: fix(EIP-5792): don't return null receipt in wallet_getCallsStatus

## 1.8.4

### Patch Changes

- ba09e60: feat: apply session key policies to batch transactions

## 1.8.3

### Patch Changes

- 815071a: fix: catch insufficient funds error from zks_estimateFee

## 1.8.2

### Patch Changes

- dba9b6c: fix: compute tx sponsorship status inside prepareTransactionRequest

## 1.8.1

### Patch Changes

- 52668dd: fix: atomic capability spec mismatch

## 1.8.0

### Minor Changes

- 2577a28: feat: Support finalized EIP-5792 spec (wallet_sendCalls)

## 1.7.3

### Patch Changes

- c10b833: fix: add call to transformHexValues in prepareTransaction

## 1.7.2

### Patch Changes

- 271dc6c: feat: Throw insufficient balance error if the user's balance can not cover the transaction cost + gas

## 1.7.1

### Patch Changes

- 671a6f9: Export getSessionStatus action

## 1.7.0

### Minor Changes

- 5630049: feat: use privy sign instead of send transaction to bypass confirmation window

### Patch Changes

- 0e9c9e4: perf: parallelize async calls in prepareTransactionRequest

## 1.6.4

### Patch Changes

- 563c4fc: Add signTransactionBatch method for raw signing of batch transactions

## 1.6.3

### Patch Changes

- 764642c: perf: remove reundant rpc call when sending transactions for sessions

## 1.6.2

### Patch Changes

- 4a6e8e5: Refactor send transaction logic and expose batch tx helper method

## 1.6.1

### Patch Changes

- e373f06: chore: remove feature flag check

## 1.6.0

### Minor Changes

- a02f759: feat: add paymaster handler in react connector for app-level sponsorship

### Patch Changes

- d6d7b92: feat: Add getSessionStatus function to abstract client and session clients

## 1.5.0

### Minor Changes

- 1eda3ec: Add session key policy checking to transaction signing logic

## 1.4.2

### Patch Changes

- 70a58fc: Update dependencies

## 1.4.1

### Patch Changes

- 30647bd: Fix undefined data in transaction so it doesn't serialize to 0x00

## 1.4.0

### Minor Changes

- 0178623: Update sendTransaction flows to use custom paymaster handler if passed in
- 0178623: Add paymaster handler functions for sending transactions

## 1.3.1

### Patch Changes

- bab7735: Fix chains sorting

  Sorting alphabetically works well for strings ("Apple" comes before "Banana").
  But, sorting numbers can produce incorrect results.
  "25" is bigger than "100", because "2" is bigger than "1".

  This makes abstractTestnet to become defaultChain instead of abstractMainnet,
  which in turn can produce some issues on dApps using AGW with both Abstract testnet and mainnet.

## 1.3.0

### Minor Changes

- 7de8115: Add non executing transaction signing

### Patch Changes

- 97015f9: Correctly pass isPrivyCrossApp flag to writeContract

## 1.2.0

### Minor Changes

- 3cf7f67: Update provider config; require chain definition

## 1.1.1

### Patch Changes

- 4fcaef4: Fix transport used for inner client

## 1.1.0

### Minor Changes

- 3d379e7: Add functions for managing EOA -> AGW linking
- b9758fc: Add ability to sign typed messages on a session client (thirdweb compat)

## 1.0.1

### Patch Changes

- 1480d43: Fixes prepareTransaction action so it does not override a manual gas value passed in

## 1.0.0

### Major Changes

- a674404: Finalize contract deployment addresses and adjust session types

## 0.1.8

### Patch Changes

- d64523c: Use gas estimation from zks_estimateFee instead of making a separate call for eth_estimateGas
- 46fd96b: Fix getSmartAccountAddressFromInitialSigner to throw if initial signer is undefined

## 0.1.7

### Patch Changes

- f3db70c: Fixed an issue that would occur in session key actions when creating an Abstract Client using the account and provider from another client as the signer

## 0.1.6

### Patch Changes

- 599ecf4: Fix EIP-5792 return type on wallet_getCallsStatus

## 0.1.5

### Patch Changes

- 5e15f01: Add new valid chain id

## 0.1.4

### Patch Changes

- f72546d: Update useCreateSession to add module if not installed

## 0.1.3

### Patch Changes

- cdecfd6: Fix incorrect package import from sessions

## 0.1.2

### Patch Changes

- 70bd5be: Add hook for createSession
- 1859431: Allow passing through additional transaction parameters for sendTransactionBatch

## 0.1.1

### Patch Changes

- 6ece839: Update message signing and typed signing to check codesize and only serialize as ERC-6942 signature if AGW is not deployed
- 7445977: Add getChainId to abstract wallet client
