# @abstract-foundation/agw-react

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
