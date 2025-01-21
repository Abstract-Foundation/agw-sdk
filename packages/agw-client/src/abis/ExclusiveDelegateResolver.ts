export const ExclusiveDelegateResolverAbi = [
  {
    type: 'function',
    name: 'DELEGATE_REGISTRY',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'GLOBAL_DELEGATION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes24',
        internalType: 'bytes24',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decodeRightsExpiration',
    inputs: [
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes24',
        internalType: 'bytes24',
      },
      {
        name: '',
        type: 'uint40',
        internalType: 'uint40',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'delegatedWalletsByRights',
    inputs: [
      {
        name: 'wallet',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes24',
        internalType: 'bytes24',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exclusiveOwnerByRights',
    inputs: [
      {
        name: 'contractAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'rights',
        type: 'bytes24',
        internalType: 'bytes24',
      },
    ],
    outputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'exclusiveWalletByRights',
    inputs: [
      {
        name: 'vault',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes24',
        internalType: 'bytes24',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'generateRightsWithExpiration',
    inputs: [
      {
        name: 'rightsIdentifier',
        type: 'bytes24',
        internalType: 'bytes24',
      },
      {
        name: 'expiration',
        type: 'uint40',
        internalType: 'uint40',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'pure',
  },
] as const;
