export const SessionKeyValidatorAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Disabled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Inited',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'sessionHash',
        type: 'bytes32',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'expiresAt',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'enum SessionLib.LimitType',
                name: 'limitType',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'limit',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'period',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.UsageLimit',
            name: 'feeLimit',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.Condition',
                    name: 'condition',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint64',
                    name: 'index',
                    type: 'uint64',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'refValue',
                    type: 'bytes32',
                  },
                  {
                    components: [
                      {
                        internalType: 'enum SessionLib.LimitType',
                        name: 'limitType',
                        type: 'uint8',
                      },
                      {
                        internalType: 'uint256',
                        name: 'limit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'period',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct SessionLib.UsageLimit',
                    name: 'limit',
                    type: 'tuple',
                  },
                ],
                internalType: 'struct SessionLib.Constraint[]',
                name: 'constraints',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct SessionLib.CallSpec[]',
            name: 'callPolicies',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
            ],
            internalType: 'struct SessionLib.TransferSpec[]',
            name: 'transferPolicies',
            type: 'tuple[]',
          },
        ],
        indexed: false,
        internalType: 'struct SessionLib.SessionSpec',
        name: 'sessionSpec',
        type: 'tuple',
      },
    ],
    name: 'SessionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'sessionHash',
        type: 'bytes32',
      },
    ],
    name: 'SessionRevoked',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'sessionData',
        type: 'bytes',
      },
    ],
    name: 'addValidationKey',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
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
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'expiresAt',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'enum SessionLib.LimitType',
                name: 'limitType',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'limit',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'period',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.UsageLimit',
            name: 'feeLimit',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.Condition',
                    name: 'condition',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint64',
                    name: 'index',
                    type: 'uint64',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'refValue',
                    type: 'bytes32',
                  },
                  {
                    components: [
                      {
                        internalType: 'enum SessionLib.LimitType',
                        name: 'limitType',
                        type: 'uint8',
                      },
                      {
                        internalType: 'uint256',
                        name: 'limit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'period',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct SessionLib.UsageLimit',
                    name: 'limit',
                    type: 'tuple',
                  },
                ],
                internalType: 'struct SessionLib.Constraint[]',
                name: 'constraints',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct SessionLib.CallSpec[]',
            name: 'callPolicies',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
            ],
            internalType: 'struct SessionLib.TransferSpec[]',
            name: 'transferPolicies',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct SessionLib.SessionSpec',
        name: 'sessionSpec',
        type: 'tuple',
      },
    ],
    name: 'createSession',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'disable',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'enum OperationType',
        name: 'operationType',
        type: 'uint8',
      },
      {
        internalType: 'bytes32',
        name: 'signedHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
    ],
    name: 'handleValidation',
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
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
    ],
    name: 'init',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'smartAccount',
        type: 'address',
      },
    ],
    name: 'isInited',
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
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'sessionHash',
        type: 'bytes32',
      },
    ],
    name: 'revokeKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32[]',
        name: 'sessionHashes',
        type: 'bytes32[]',
      },
    ],
    name: 'revokeKeys',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'signer',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'expiresAt',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'enum SessionLib.LimitType',
                name: 'limitType',
                type: 'uint8',
              },
              {
                internalType: 'uint256',
                name: 'limit',
                type: 'uint256',
              },
              {
                internalType: 'uint256',
                name: 'period',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.UsageLimit',
            name: 'feeLimit',
            type: 'tuple',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.Condition',
                    name: 'condition',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint64',
                    name: 'index',
                    type: 'uint64',
                  },
                  {
                    internalType: 'bytes32',
                    name: 'refValue',
                    type: 'bytes32',
                  },
                  {
                    components: [
                      {
                        internalType: 'enum SessionLib.LimitType',
                        name: 'limitType',
                        type: 'uint8',
                      },
                      {
                        internalType: 'uint256',
                        name: 'limit',
                        type: 'uint256',
                      },
                      {
                        internalType: 'uint256',
                        name: 'period',
                        type: 'uint256',
                      },
                    ],
                    internalType: 'struct SessionLib.UsageLimit',
                    name: 'limit',
                    type: 'tuple',
                  },
                ],
                internalType: 'struct SessionLib.Constraint[]',
                name: 'constraints',
                type: 'tuple[]',
              },
            ],
            internalType: 'struct SessionLib.CallSpec[]',
            name: 'callPolicies',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'uint256',
                name: 'maxValuePerUse',
                type: 'uint256',
              },
              {
                components: [
                  {
                    internalType: 'enum SessionLib.LimitType',
                    name: 'limitType',
                    type: 'uint8',
                  },
                  {
                    internalType: 'uint256',
                    name: 'limit',
                    type: 'uint256',
                  },
                  {
                    internalType: 'uint256',
                    name: 'period',
                    type: 'uint256',
                  },
                ],
                internalType: 'struct SessionLib.UsageLimit',
                name: 'valueLimit',
                type: 'tuple',
              },
            ],
            internalType: 'struct SessionLib.TransferSpec[]',
            name: 'transferPolicies',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct SessionLib.SessionSpec',
        name: 'spec',
        type: 'tuple',
      },
    ],
    name: 'sessionState',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'expiresAt',
            type: 'uint256',
          },
          {
            internalType: 'enum SessionLib.Status',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'uint256',
            name: 'feesRemaining',
            type: 'uint256',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'remaining',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.LimitState[]',
            name: 'transferValue',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'remaining',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.LimitState[]',
            name: 'callValue',
            type: 'tuple[]',
          },
          {
            components: [
              {
                internalType: 'uint256',
                name: 'remaining',
                type: 'uint256',
              },
              {
                internalType: 'address',
                name: 'target',
                type: 'address',
              },
              {
                internalType: 'bytes4',
                name: 'selector',
                type: 'bytes4',
              },
              {
                internalType: 'uint256',
                name: 'index',
                type: 'uint256',
              },
            ],
            internalType: 'struct SessionLib.LimitState[]',
            name: 'callParams',
            type: 'tuple[]',
          },
        ],
        internalType: 'struct SessionLib.SessionState',
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
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: 'sessionHash',
        type: 'bytes32',
      },
    ],
    name: 'sessionStatus',
    outputs: [
      {
        internalType: 'enum SessionLib.Status',
        name: '',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4',
      },
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'signedHash',
        type: 'bytes32',
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
            internalType: 'bytes32[]',
            name: 'factoryDeps',
            type: 'bytes32[]',
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
        internalType: 'struct Transaction',
        name: 'transaction',
        type: 'tuple',
      },
      {
        internalType: 'bytes',
        name: 'hookData',
        type: 'bytes',
      },
    ],
    name: 'validationHook',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'version',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
] as const;
