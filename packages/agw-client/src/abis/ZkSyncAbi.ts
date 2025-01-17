export const ZkSyncAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchNumber',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'batchHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'BlockCommit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'batchNumber',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'batchHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'commitment',
        type: 'bytes32',
      },
    ],
    name: 'BlockExecution',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalBatchesCommitted',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalBatchesVerified',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'totalBatchesExecuted',
        type: 'uint256',
      },
    ],
    name: 'BlocksRevert',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'previousLastVerifiedBatch',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'currentLastVerifiedBatch',
        type: 'uint256',
      },
    ],
    name: 'BlocksVerification',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'facet',
                type: 'address',
              },
              {
                internalType: 'enum Diamond.Action',
                name: 'action',
                type: 'uint8',
              },
              {
                internalType: 'bool',
                name: 'isFreezable',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct Diamond.FacetCut[]',
            name: 'facetCuts',
            type: 'tuple[]',
          },
          {
            internalType: 'address',
            name: 'initAddress',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'initCalldata',
            type: 'bytes',
          },
        ],
        indexed: false,
        internalType: 'struct Diamond.DiamondCutData',
        name: 'diamondCut',
        type: 'tuple',
      },
    ],
    name: 'ExecuteUpgrade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Freeze',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'isPorterAvailable',
        type: 'bool',
      },
    ],
    name: 'IsPorterAvailableStatusUpdate',
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
        indexed: false,
        internalType: 'uint128',
        name: 'oldNominator',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'oldDenominator',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'newNominator',
        type: 'uint128',
      },
      {
        indexed: false,
        internalType: 'uint128',
        name: 'newDenominator',
        type: 'uint128',
      },
    ],
    name: 'NewBaseTokenMultiplier',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'enum PubdataPricingMode',
            name: 'pubdataPricingMode',
            type: 'uint8',
          },
          {
            internalType: 'uint32',
            name: 'batchOverheadL1Gas',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxPubdataPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxL2GasPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'priorityTxMaxPubdata',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'minimalL2GasPrice',
            type: 'uint64',
          },
        ],
        indexed: false,
        internalType: 'struct FeeParams',
        name: 'oldFeeParams',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'enum PubdataPricingMode',
            name: 'pubdataPricingMode',
            type: 'uint8',
          },
          {
            internalType: 'uint32',
            name: 'batchOverheadL1Gas',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxPubdataPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxL2GasPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'priorityTxMaxPubdata',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'minimalL2GasPrice',
            type: 'uint64',
          },
        ],
        indexed: false,
        internalType: 'struct FeeParams',
        name: 'newFeeParams',
        type: 'tuple',
      },
    ],
    name: 'NewFeeParams',
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
        indexed: false,
        internalType: 'uint256',
        name: 'txId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'txHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'expirationTimestamp',
        type: 'uint64',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'txType',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'from',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'to',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'gasPerPubdataByteLimit',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'maxPriorityFeePerGas',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'paymaster',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'nonce',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256',
          },
          {
            internalType: 'uint256[4]',
            name: 'reserved',
            type: 'uint256[4]',
          },
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
          {
            internalType: 'uint256[]',
            name: 'factoryDeps',
            type: 'uint256[]',
          },
          {
            internalType: 'bytes',
            name: 'paymasterInput',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'reservedDynamic',
            type: 'bytes',
          },
        ],
        indexed: false,
        internalType: 'struct L2CanonicalTransaction',
        name: 'transaction',
        type: 'tuple',
      },
      {
        indexed: false,
        internalType: 'bytes[]',
        name: 'factoryDeps',
        type: 'bytes[]',
      },
    ],
    name: 'NewPriorityRequest',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldPriorityTxMaxGasLimit',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newPriorityTxMaxGasLimit',
        type: 'uint256',
      },
    ],
    name: 'NewPriorityTxMaxGasLimit',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'oldTransactionFilterer',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'newTransactionFilterer',
        type: 'address',
      },
    ],
    name: 'NewTransactionFilterer',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'facet',
                type: 'address',
              },
              {
                internalType: 'enum Diamond.Action',
                name: 'action',
                type: 'uint8',
              },
              {
                internalType: 'bool',
                name: 'isFreezable',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct Diamond.FacetCut[]',
            name: 'facetCuts',
            type: 'tuple[]',
          },
          {
            internalType: 'address',
            name: 'initAddress',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'initCalldata',
            type: 'bytes',
          },
        ],
        indexed: false,
        internalType: 'struct Diamond.DiamondCutData',
        name: 'diamondCut',
        type: 'tuple',
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'proposalId',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'proposalSalt',
        type: 'bytes32',
      },
    ],
    name: 'ProposeTransparentUpgrade',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'Unfreeze',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'validatorAddress',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bool',
        name: 'isActive',
        type: 'bool',
      },
    ],
    name: 'ValidatorStatusUpdate',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'enum PubdataPricingMode',
        name: 'validiumMode',
        type: 'uint8',
      },
    ],
    name: 'ValidiumModeStatusUpdate',
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
    name: 'baseTokenGasPriceMultiplierDenominator',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'baseTokenGasPriceMultiplierNominator',
    outputs: [
      {
        internalType: 'uint128',
        name: '',
        type: 'uint128',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'sender',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'contractL2',
            type: 'address',
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
        internalType: 'struct BridgehubL2TransactionRequest',
        name: '_request',
        type: 'tuple',
      },
    ],
    name: 'bridgehubRequestL2Transaction',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'canonicalTxHash',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'enum PubdataPricingMode',
            name: 'pubdataPricingMode',
            type: 'uint8',
          },
          {
            internalType: 'uint32',
            name: 'batchOverheadL1Gas',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxPubdataPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'maxL2GasPerBatch',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'priorityTxMaxPubdata',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'minimalL2GasPrice',
            type: 'uint64',
          },
        ],
        internalType: 'struct FeeParams',
        name: '_newFeeParams',
        type: 'tuple',
      },
    ],
    name: 'changeFeeParams',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo',
        name: '_lastCommittedBatchData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'timestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'newStateRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'bootloaderHeapInitialContentsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'eventsQueueStateHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'systemLogs',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'pubdataCommitments',
            type: 'bytes',
          },
        ],
        internalType: 'struct IExecutor.CommitBatchInfo[]',
        name: '_newBatchesData',
        type: 'tuple[]',
      },
    ],
    name: 'commitBatches',
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
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo',
        name: '_lastCommittedBatchData',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'timestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'newStateRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'bootloaderHeapInitialContentsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'eventsQueueStateHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes',
            name: 'systemLogs',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'pubdataCommitments',
            type: 'bytes',
          },
        ],
        internalType: 'struct IExecutor.CommitBatchInfo[]',
        name: '_newBatchesData',
        type: 'tuple[]',
      },
    ],
    name: 'commitBatchesSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo[]',
        name: '_batchesData',
        type: 'tuple[]',
      },
    ],
    name: 'executeBatches',
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
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo[]',
        name: '_batchesData',
        type: 'tuple[]',
      },
    ],
    name: 'executeBatchesSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'facet',
                type: 'address',
              },
              {
                internalType: 'enum Diamond.Action',
                name: 'action',
                type: 'uint8',
              },
              {
                internalType: 'bool',
                name: 'isFreezable',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct Diamond.FacetCut[]',
            name: 'facetCuts',
            type: 'tuple[]',
          },
          {
            internalType: 'address',
            name: 'initAddress',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'initCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct Diamond.DiamondCutData',
        name: '_diamondCut',
        type: 'tuple',
      },
    ],
    name: 'executeUpgrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
    ],
    name: 'facetAddress',
    outputs: [
      {
        internalType: 'address',
        name: 'facet',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facetAddresses',
    outputs: [
      {
        internalType: 'address[]',
        name: 'facets',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_facet',
        type: 'address',
      },
    ],
    name: 'facetFunctionSelectors',
    outputs: [
      {
        internalType: 'bytes4[]',
        name: '',
        type: 'bytes4[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'facets',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'addr',
            type: 'address',
          },
          {
            internalType: 'bytes4[]',
            name: 'selectors',
            type: 'bytes4[]',
          },
        ],
        internalType: 'struct IGetters.Facet[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
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
        internalType: 'bytes',
        name: '_message',
        type: 'bytes',
      },
      {
        internalType: 'bytes32[]',
        name: '_merkleProof',
        type: 'bytes32[]',
      },
    ],
    name: 'finalizeEthWithdrawal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'freezeDiamond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAdmin',
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
    name: 'getBaseToken',
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
    name: 'getBaseTokenBridge',
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
    name: 'getBridgehub',
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
    name: 'getFirstUnprocessedPriorityTx',
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
    name: 'getL2BootloaderBytecodeHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getL2DefaultAccountBytecodeHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getL2SystemContractsUpgradeBatchNumber',
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
    name: 'getL2SystemContractsUpgradeTxHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getName',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getPendingAdmin',
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
    name: 'getPriorityQueueSize',
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
    name: 'getPriorityTxMaxGasLimit',
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
    name: 'getProtocolVersion',
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
    name: 'getPubdataPricingMode',
    outputs: [
      {
        internalType: 'enum PubdataPricingMode',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSemverProtocolVersion',
    outputs: [
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
      {
        internalType: 'uint32',
        name: '',
        type: 'uint32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getStateTransitionManager',
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
    name: 'getTotalBatchesCommitted',
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
    name: 'getTotalBatchesExecuted',
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
    name: 'getTotalBatchesVerified',
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
    name: 'getTotalPriorityTxs',
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
    name: 'getVerifier',
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
    name: 'getVerifierParams',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'recursionNodeLevelVkHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'recursionLeafLevelVkHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'recursionCircuitsSetVksHash',
            type: 'bytes32',
          },
        ],
        internalType: 'struct VerifierParams',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'isDiamondStorageFrozen',
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
        name: '_l2BatchNumber',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_l2MessageIndex',
        type: 'uint256',
      },
    ],
    name: 'isEthWithdrawalFinalized',
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
        name: '_facet',
        type: 'address',
      },
    ],
    name: 'isFacetFreezable',
    outputs: [
      {
        internalType: 'bool',
        name: 'isFreezable',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: '_selector',
        type: 'bytes4',
      },
    ],
    name: 'isFunctionFreezable',
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
        name: '_address',
        type: 'address',
      },
    ],
    name: 'isValidator',
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
        name: '_batchNumber',
        type: 'uint256',
      },
    ],
    name: 'l2LogsRootHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: 'merkleRoot',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
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
    name: 'priorityQueueFrontOperation',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'canonicalTxHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'expirationTimestamp',
            type: 'uint64',
          },
          {
            internalType: 'uint192',
            name: 'layer2Tip',
            type: 'uint192',
          },
        ],
        internalType: 'struct PriorityOperation',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo',
        name: '_prevBatch',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo[]',
        name: '_committedBatches',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'recursiveAggregationInput',
            type: 'uint256[]',
          },
          {
            internalType: 'uint256[]',
            name: 'serializedProof',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct IExecutor.ProofInput',
        name: '_proof',
        type: 'tuple',
      },
    ],
    name: 'proveBatches',
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
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo',
        name: '_prevBatch',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint64',
            name: 'batchNumber',
            type: 'uint64',
          },
          {
            internalType: 'bytes32',
            name: 'batchHash',
            type: 'bytes32',
          },
          {
            internalType: 'uint64',
            name: 'indexRepeatedStorageChanges',
            type: 'uint64',
          },
          {
            internalType: 'uint256',
            name: 'numberOfLayer1Txs',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'priorityOperationsHash',
            type: 'bytes32',
          },
          {
            internalType: 'bytes32',
            name: 'l2LogsTreeRoot',
            type: 'bytes32',
          },
          {
            internalType: 'uint256',
            name: 'timestamp',
            type: 'uint256',
          },
          {
            internalType: 'bytes32',
            name: 'commitment',
            type: 'bytes32',
          },
        ],
        internalType: 'struct IExecutor.StoredBatchInfo[]',
        name: '_committedBatches',
        type: 'tuple[]',
      },
      {
        components: [
          {
            internalType: 'uint256[]',
            name: 'recursiveAggregationInput',
            type: 'uint256[]',
          },
          {
            internalType: 'uint256[]',
            name: 'serializedProof',
            type: 'uint256[]',
          },
        ],
        internalType: 'struct IExecutor.ProofInput',
        name: '_proof',
        type: 'tuple',
      },
    ],
    name: 'proveBatchesSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
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
        name: '_contractL2',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_l2Value',
        type: 'uint256',
      },
      {
        internalType: 'bytes',
        name: '_calldata',
        type: 'bytes',
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
      {
        internalType: 'bytes[]',
        name: '_factoryDeps',
        type: 'bytes[]',
      },
      {
        internalType: 'address',
        name: '_refundRecipient',
        type: 'address',
      },
    ],
    name: 'requestL2Transaction',
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
        internalType: 'uint256',
        name: '_newLastBatch',
        type: 'uint256',
      },
    ],
    name: 'revertBatches',
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
        name: '_newLastBatch',
        type: 'uint256',
      },
    ],
    name: 'revertBatchesSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
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
        internalType: 'bool',
        name: '_zkPorterIsAvailable',
        type: 'bool',
      },
    ],
    name: 'setPorterAvailability',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_newPriorityTxMaxGasLimit',
        type: 'uint256',
      },
    ],
    name: 'setPriorityTxMaxGasLimit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum PubdataPricingMode',
        name: '_pricingMode',
        type: 'uint8',
      },
    ],
    name: 'setPubdataPricingMode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint128',
        name: '_nominator',
        type: 'uint128',
      },
      {
        internalType: 'uint128',
        name: '_denominator',
        type: 'uint128',
      },
    ],
    name: 'setTokenMultiplier',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_transactionFilterer',
        type: 'address',
      },
    ],
    name: 'setTransactionFilterer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_validator',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_active',
        type: 'bool',
      },
    ],
    name: 'setValidator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_batchNumber',
        type: 'uint256',
      },
    ],
    name: 'storedBatchHash',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'transferEthToSharedBridge',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unfreezeDiamond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_protocolVersion',
        type: 'uint256',
      },
      {
        components: [
          {
            components: [
              {
                internalType: 'address',
                name: 'facet',
                type: 'address',
              },
              {
                internalType: 'enum Diamond.Action',
                name: 'action',
                type: 'uint8',
              },
              {
                internalType: 'bool',
                name: 'isFreezable',
                type: 'bool',
              },
              {
                internalType: 'bytes4[]',
                name: 'selectors',
                type: 'bytes4[]',
              },
            ],
            internalType: 'struct Diamond.FacetCut[]',
            name: 'facetCuts',
            type: 'tuple[]',
          },
          {
            internalType: 'address',
            name: 'initAddress',
            type: 'address',
          },
          {
            internalType: 'bytes',
            name: 'initCalldata',
            type: 'bytes',
          },
        ],
        internalType: 'struct Diamond.DiamondCutData',
        name: '_cutData',
        type: 'tuple',
      },
    ],
    name: 'upgradeChainFromVersion',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
