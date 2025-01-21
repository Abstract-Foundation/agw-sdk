export const DelegateRegistryAbi = [
  {
    type: 'function',
    name: 'checkDelegateForAll',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'valid',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkDelegateForContract',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'valid',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkDelegateForERC1155',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
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
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkDelegateForERC20',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkDelegateForERC721',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
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
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'valid',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'delegateAll',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'delegateContract',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'delegateERC1155',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
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
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'delegateERC20',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'delegateERC721',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'contract_',
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
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: 'hash',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'getDelegationsFromHashes',
    inputs: [
      {
        name: 'hashes',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'delegations_',
        type: 'tuple[]',
        internalType: 'struct IDelegateRegistry.Delegation[]',
        components: [
          {
            name: 'type_',
            type: 'uint8',
            internalType: 'enum IDelegateRegistry.DelegationType',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'from',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'rights',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'contract_',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'tokenId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getIncomingDelegationHashes',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'delegationHashes',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getIncomingDelegations',
    inputs: [
      {
        name: 'to',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'delegations_',
        type: 'tuple[]',
        internalType: 'struct IDelegateRegistry.Delegation[]',
        components: [
          {
            name: 'type_',
            type: 'uint8',
            internalType: 'enum IDelegateRegistry.DelegationType',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'from',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'rights',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'contract_',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'tokenId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOutgoingDelegationHashes',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'delegationHashes',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getOutgoingDelegations',
    inputs: [
      {
        name: 'from',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'delegations_',
        type: 'tuple[]',
        internalType: 'struct IDelegateRegistry.Delegation[]',
        components: [
          {
            name: 'type_',
            type: 'uint8',
            internalType: 'enum IDelegateRegistry.DelegationType',
          },
          {
            name: 'to',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'from',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'rights',
            type: 'bytes32',
            internalType: 'bytes32',
          },
          {
            name: 'contract_',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'tokenId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'amount',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'multicall',
    inputs: [
      {
        name: 'data',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    outputs: [
      {
        name: 'results',
        type: 'bytes[]',
        internalType: 'bytes[]',
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    name: 'readSlot',
    inputs: [
      {
        name: 'location',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    outputs: [
      {
        name: 'contents',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'readSlots',
    inputs: [
      {
        name: 'locations',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    outputs: [
      {
        name: 'contents',
        type: 'bytes32[]',
        internalType: 'bytes32[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'supportsInterface',
    inputs: [
      {
        name: 'interfaceId',
        type: 'bytes4',
        internalType: 'bytes4',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'sweep',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'DelegateAll',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateContract',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateERC1155',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'rights',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateERC20',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'rights',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'amount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateERC721',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'contract_',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'tokenId',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'rights',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'enable',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'MulticallFailed',
    inputs: [],
  },
] as const;
