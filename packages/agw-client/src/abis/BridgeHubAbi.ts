export const BridgeHubAbi = [
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'AddressTooLow',
    type: 'error',
  },
  {
    inputs: [],
    name: 'BridgeHubAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ChainIdTooBig',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'expectedMsgValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'providedMsgValue',
        type: 'uint256',
      },
    ],
    name: 'MsgValueMismatch',
    type: 'error',
  },
  {
    inputs: [],
    name: 'NotInitializedReentrancyGuard',
    type: 'error',
  },
  {
    inputs: [],
    name: 'Reentrancy',
    type: 'error',
  },
  {
    inputs: [],
    name: 'STMAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'STMNotRegistered',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SharedBridgeNotSet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SlotOccupied',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'TokenAlreadyRegistered',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'token',
        type: 'address',
      },
    ],
    name: 'TokenNotRegistered',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'caller',
        type: 'address',
      },
    ],
    name: 'Unauthorized',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'expectedMagicValue',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'providedMagicValue',
        type: 'uint256',
      },
    ],
    name: 'WrongMagicValue',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroAddress',
    type: 'error',
  },
  {
    inputs: [],
    name: 'ZeroChainId',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newAdmin',
        type: 'address',
      },
    ],
    name: 'NewAdmin',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'chainId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'stateTransitionManager',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'chainGovernance',
        type: 'address',
      },
    ],
    name: 'NewChain',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'oldPendingAdmin',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newPendingAdmin',
        type: 'address',
      },
    ],
    name: 'NewPendingAdmin',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferStarted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'addStateTransitionManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'addToken',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'admin',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'baseToken',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_baseToken',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_salt',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_admin',
        type: 'address',
      },
      {
        internalType: 'bytes',
        name: '_initData',
        type: 'bytes',
      },
    ],
    name: 'createNewChain',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'getHyperchain',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_gasPrice',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2GasLimit',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2GasPerPubdataByteLimit',
        type: 'uint256',
      },
    ],
    name: 'l2TransactionBaseCost',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pendingOwner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'bytes32',
        name: '_l2TxHash',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: '_l2TxNumberInBatch',
        type: 'uint16',
      },
      {
        internalType: 'bytes32[]',
        name: '_merkleProof',
        type: 'bytes32[]',
      },
      {
        internalType: 'enum TxStatus',
        name: '_status',
        type: 'uint8',
      },
    ],
    name: 'proveL1ToL2TransactionStatus',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_batchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint8',
            name: 'l2ShardId',
            type: 'uint8',
          },
          {
            internalType: 'bool',
            name: 'isService',
            type: 'bool',
          },
          {
            internalType: 'uint16',
            name: 'txNumberInBatch',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'bytes32',
            name: 'key',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'value',
            type: 'bytes32',
          },
        ],
        internalType: 'struct L2Log',
        name: '_log',
        type: 'tuple',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'proveL2LogInclusion',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_batchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_index',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'uint16',
            name: 'txNumberInBatch',
            type: 'uint16',
          },
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
        ],
        internalType: 'struct L2Message',
        name: '_message',
        type: 'tuple',
      },
      {
        internalType: 'bytes32[]',
        name: '_proof',
        type: 'bytes32[]',
      },
    ],
    name: 'proveL2MessageInclusion',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'removeStateTransitionManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'mintValue',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'l2Contract',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'l2Value',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'l2Calldata',
            type: 'bytes',
          },
          {
            internalType: 'uint256',
            name: 'l2GasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'bytes[]',
            name: 'factoryDeps',
            type: 'bytes[]',
          },
          {
            internalType: 'address',
            name: 'refundRecipient',
            type: 'address',
          },
        ],
        internalType: 'struct L2TransactionRequestDirect',
        name: '_request',
        type: 'tuple',
      },
    ],
    name: 'requestL2TransactionDirect',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'canonicalTxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'chainId',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'mintValue',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2Value',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'l2GasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'refundRecipient',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'secondBridgeAddress',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'secondBridgeValue',
            type: 'uint256',
          },
          {
            internalType: 'bytes',
            name: 'secondBridgeCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct L2TransactionRequestTwoBridgesOuter',
        name: '_request',
        type: 'tuple',
      },
    ],
    name: 'requestL2TransactionTwoBridges',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'canonicalTxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_newPendingAdmin',
        type: 'address',
      },
    ],
    name: 'setPendingAdmin',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_sharedBridge',
        type: 'address',
      },
    ],
    name: 'setSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'sharedBridge',
    outputs: [
      {
        internalType: 'contract IL1SharedBridge',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_chainId',
        type: 'uint256',
      },
    ],
    name: 'stateTransitionManager',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_stateTransitionManager',
        type: 'address',
      },
    ],
    name: 'stateTransitionManagerIsRegistered',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_token',
        type: 'address',
      },
    ],
    name: 'tokenIsRegistered',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
