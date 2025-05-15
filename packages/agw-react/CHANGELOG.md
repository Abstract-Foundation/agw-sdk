# @abstract-foundation/agw-react

## 1.7.1

### Patch Changes

- Updated dependencies [671a6f9]
  - @abstract-foundation/agw-client@1.7.1

## 1.7.0

### Minor Changes

- 5630049: feat: use privy sign instead of send transaction to bypass confirmation window

### Patch Changes

- Updated dependencies [5630049]
- Updated dependencies [0e9c9e4]
  - @abstract-foundation/agw-client@1.7.0

## 1.6.7

### Patch Changes

- Updated dependencies [563c4fc]
  - @abstract-foundation/agw-client@1.6.4

## 1.6.6

### Patch Changes

- 764642c: perf: remove reundant rpc call when sending transactions for sessions
- Updated dependencies [764642c]
  - @abstract-foundation/agw-client@1.6.3

## 1.6.5

### Patch Changes

- c6cb542: Update privy cross app package

## 1.6.4

### Patch Changes

- 524aa2b: fix: Memoize wagmi config in AbstractWalletProvider

## 1.6.3

### Patch Changes

- e10d464: Update privy dependencies

## 1.6.2

### Patch Changes

- 4a6e8e5: Refactor send transaction logic and expose batch tx helper method
- Updated dependencies [4a6e8e5]
  - @abstract-foundation/agw-client@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies [e373f06]
  - @abstract-foundation/agw-client@1.6.1

## 1.6.0

### Minor Changes

- a02f759: feat: add paymaster handler in react connector for app-level sponsorship

### Patch Changes

- Updated dependencies [a02f759]
- Updated dependencies [d6d7b92]
  - @abstract-foundation/agw-client@1.6.0

## 1.5.5

### Patch Changes

- d0b0842: Export usePrivyCrossAppProvider for advanced usage
- Updated dependencies [1eda3ec]
  - @abstract-foundation/agw-client@1.5.0

## 1.5.4

### Patch Changes

- 70a58fc: Update dependencies
- Updated dependencies [70a58fc]
  - @abstract-foundation/agw-client@1.4.2

## 1.5.3

### Patch Changes

- Updated dependencies [30647bd]
  - @abstract-foundation/agw-client@1.4.1

## 1.5.2

### Patch Changes

- 77b8eca: Make queryClient optional

## 1.5.1

### Patch Changes

- 943bf8b: Fix injected wagmi connector to reconnect on reload

## 1.5.0

### Minor Changes

- 0178623: Update sendTransaction flows to use custom paymaster handler if passed in

### Patch Changes

- Updated dependencies [0178623]
- Updated dependencies [0178623]
  - @abstract-foundation/agw-client@1.4.0

## 1.4.4

### Patch Changes

- bab7735: Fix chains sorting

  Sorting alphabetically works well for strings ("Apple" comes before "Banana").
  But, sorting numbers can produce incorrect results.
  "25" is bigger than "100", because "2" is bigger than "1".

  This makes abstractTestnet to become defaultChain instead of abstractMainnet,
  which in turn can produce some issues on dApps using AGW with both Abstract testnet and mainnet.

- Updated dependencies [bab7735]
  - @abstract-foundation/agw-client@1.3.1

## 1.4.3

### Patch Changes

- 76244d1: Add optional queryClient to providers

## 1.4.2

### Patch Changes

- fc3c63c: Allow passthru of zks_estimateFee to underlying provider in privy native flow

## 1.4.1

### Patch Changes

- acfc601: Bump cross app connect dependency

## 1.4.0

### Minor Changes

- 7de8115: Add non executing transaction signing

### Patch Changes

- Updated dependencies [7de8115]
- Updated dependencies [97015f9]
  - @abstract-foundation/agw-client@1.3.0

## 1.3.0

### Minor Changes

- 3cf7f67: Update provider config; require chain definition

### Patch Changes

- 38a9b11: remove wagmi disconnected shim before creating connector
- Updated dependencies [3cf7f67]
  - @abstract-foundation/agw-client@1.2.0

## 1.2.4

### Patch Changes

- ba55a52: Export privy InjectWagmiConnector for advanced usages

## 1.2.3

### Patch Changes

- 4fcaef4: Fix transport used in useAbstractClient
- Updated dependencies [4fcaef4]
  - @abstract-foundation/agw-client@1.1.1

## 1.2.2

### Patch Changes

- cc4dc1a: Fix transport used in useAbstractClient

## 1.2.1

### Patch Changes

- 895f4bc: Pass custom transport to read functions if needed

## 1.2.0

### Minor Changes

- ae2ad0a: Update privy packages to properly identify connected chain

## 1.1.0

### Minor Changes

- 63547e1: Fix typing for wallet extension

### Patch Changes

- 51baf98: fix: Update wagmi connector to prefer chain object from config instead of defaultChains
- Updated dependencies [3d379e7]
- Updated dependencies [b9758fc]
  - @abstract-foundation/agw-client@1.1.0

## 1.0.2

### Patch Changes

- 0f861e2: fix: Update wagmi connector to prefer chain object from config instead of defaultChains
- f80f18c: fix: throw error if switching to unsupported chain

## 1.0.1

### Patch Changes

- Updated dependencies [1480d43]
  - @abstract-foundation/agw-client@1.0.1

## 1.0.0

### Major Changes

- a674404: Finalize contract deployment addresses and adjust session types

### Patch Changes

- Updated dependencies [a674404]
  - @abstract-foundation/agw-client@1.0.0

## 0.1.10

### Patch Changes

- Updated dependencies [d64523c]
- Updated dependencies [46fd96b]
  - @abstract-foundation/agw-client@0.1.8

## 0.1.9

### Patch Changes

- Updated dependencies [f3db70c]
  - @abstract-foundation/agw-client@0.1.7

## 0.1.8

### Patch Changes

- d9e4c71: Don't override privy login options if they are provided
- Updated dependencies [599ecf4]
  - @abstract-foundation/agw-client@0.1.6

## 0.1.6

### Patch Changes

- f72546d: Update useCreateSession to add module if not installed
- Updated dependencies [f72546d]
  - @abstract-foundation/agw-client@0.1.4

## 0.1.5

### Patch Changes

- ddb763e: Fix query running before dependency is complete

## 0.1.4

### Patch Changes

- cdecfd6: Fix incorrect package import from sessions
- Updated dependencies [cdecfd6]
  - @abstract-foundation/agw-client@0.1.3

## 0.1.3

### Patch Changes

- a847956: Add useRevokeSessions hook
- 6550375: Make privy ready check more aggressive to prevent empty wagmi context
- 27ab46d: Update privy cross app flow to return both smart account and signer addresses

## 0.1.2

### Patch Changes

- 70bd5be: Add hook for createSession
- Updated dependencies [70bd5be]
- Updated dependencies [1859431]
  - @abstract-foundation/agw-client@0.1.2

## 0.1.1

### Patch Changes

- f83397f: Override transport when provider chain is not a supported chain
- 7445977: Add getChainId to abstract wallet client
- Updated dependencies [6ece839]
- Updated dependencies [7445977]
  - @abstract-foundation/agw-client@0.1.1
