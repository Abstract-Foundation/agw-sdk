const UniversalSignatureValidatorAbi = [
  {
    inputs: [
      {
        name: '_signer',
        type: 'address',
      },
      {
        name: '_hash',
        type: 'bytes32',
      },
      {
        name: '_signature',
        type: 'bytes',
      },
    ],
    outputs: [
      {
        type: 'boolean',
      },
    ],
    name: 'isValidUniversalSig',
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export default UniversalSignatureValidatorAbi;
