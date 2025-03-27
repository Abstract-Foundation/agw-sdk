import {
  encodeAbiParameters,
  maxInt256,
  parseEther,
  toFunctionSelector,
  TypedDataDefinition,
} from 'viem';

import {
  ConstraintCondition,
  LimitType,
  LimitUnlimited,
  LimitZero,
  SessionConfig,
} from '../src/sessions.js';

const exampleTypedData: TypedDataDefinition = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 11124,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  message: {
    contents: 'Hello Bob',
    from: {
      name: 'Alice',
      wallet: '0x0000000000000000000000000000000000001234',
    },
    to: {
      name: 'Bob',
      wallet: '0x0000000000000000000000000000000000005678',
    },
  },
};

const sessionSignerAddress = '0x0000000000000000000000000000000000001234';
const sessionTargetAddress = '0x000000000000000000000000000000000000abab';
const sessionApprovalTargetAddress =
  '0x000000000000000000000000000000000000cdef';
const sessionSelector = '0xabababab';

const sessionExpiry = BigInt(
  Math.floor(new Date(Date.now() + 1000 * 60 * 60 * 24).getTime() / 1000),
);

const sessionWithSimpleCallPolicy: SessionConfig = {
  signer: sessionSignerAddress,
  expiresAt: sessionExpiry,
  feeLimit: {
    limitType: LimitType.Lifetime,
    limit: 0n,
    period: 0n,
  },
  callPolicies: [
    {
      target: sessionTargetAddress,
      valueLimit: {
        limitType: LimitType.Lifetime,
        limit: 0n,
        period: 0n,
      },
      maxValuePerUse: 0n,
      selector: sessionSelector,
      constraints: [],
    },
  ],
  transferPolicies: [],
};

const sessionWithTransferPolicy: SessionConfig = {
  signer: sessionSignerAddress,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limitType: LimitType.Lifetime,
    limit: 0n,
    period: 0n,
  },
  callPolicies: [],
  transferPolicies: [
    {
      target: sessionTargetAddress,
      valueLimit: {
        limitType: LimitType.Lifetime,
        limit: 0n,
        period: 0n,
      },
      maxValuePerUse: 0n,
    },
  ],
};

const sessionWithUnrestrictedApprovalCallPolicy: SessionConfig = {
  signer: sessionSignerAddress,
  expiresAt: sessionExpiry,
  feeLimit: {
    limitType: LimitType.Lifetime,
    limit: 0n,
    period: 0n,
  },
  callPolicies: [
    {
      target: sessionTargetAddress,
      valueLimit: {
        limitType: LimitType.Lifetime,
        limit: 0n,
        period: 0n,
      },
      maxValuePerUse: 0n,
      selector: toFunctionSelector('approve(address,uint256)'),
      constraints: [],
    },
  ],
  transferPolicies: [],
};

const sessionWithConstrainedApprovalCallPolicy: SessionConfig = {
  signer: sessionSignerAddress,
  expiresAt: sessionExpiry,
  feeLimit: {
    limitType: LimitType.Lifetime,
    limit: 0n,
    period: 0n,
  },
  callPolicies: [
    {
      target: sessionTargetAddress,
      valueLimit: {
        limitType: LimitType.Lifetime,
        limit: 0n,
        period: 0n,
      },
      maxValuePerUse: 0n,
      selector: toFunctionSelector('approve(address,uint256)'),
      constraints: [
        {
          condition: ConstraintCondition.Equal,
          index: 0n,
          limit: LimitUnlimited,
          refValue: encodeAbiParameters(
            [{ type: 'address' }],
            [sessionApprovalTargetAddress],
          ),
        },
      ],
    },
  ],
  transferPolicies: [],
};

export const sampleSessionConfigs: SessionConfig[] = [
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther('1'),
      period: BigInt(0),
    },
    callPolicies: [
      {
        target: '0xF99E6e273a90Fac72F3692B033A46e8b602DC44e',
        selector: toFunctionSelector('burnAndMint(uint256[],uint256[])'),
        valueLimit: LimitZero,
        maxValuePerUse: BigInt(0),
        constraints: [],
      },
      {
        target: '0x57E12aBdF617FcD0D2ab6984C289075aA90CAc8C',
        selector: toFunctionSelector('setApprovalForAll(address,bool)'),
        valueLimit: LimitZero,
        maxValuePerUse: BigInt(0),
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0xF99E6e273a90Fac72F3692B033A46e8b602DC44e'],
            ),
          },
        ],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: '0xcf1C7AcE881983CdD649881b35FC9E977453d4D6',
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: 1,
      limit: parseEther('30'),
      period: BigInt(0),
    },
    callPolicies: [
      {
        target: '0xe88ba37DE1F9d88989ae079AB6876F917EF64f3d',
        selector: '0x3beba5c7',
        valueLimit: {
          limitType: 1,
          limit: parseEther('30'),
          period: BigInt(0),
        },
        maxValuePerUse: parseEther('30'),
        constraints: [],
      },
      {
        target: '0xe88ba37DE1F9d88989ae079AB6876F917EF64f3d',
        selector: '0x00f041ef',
        valueLimit: {
          limitType: 1,
          limit: parseEther('30'),
          period: BigInt(0),
        },
        maxValuePerUse: parseEther('30'),
        constraints: [],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther('10000'),
      period: 0n,
    },
    callPolicies: [
      {
        target: '0x84A71ccD554Cc1b02749b35d22F684CC8ec987e1',
        selector: toFunctionSelector('approve(address,uint256)'),
        valueLimit: LimitUnlimited,
        maxValuePerUse: parseEther('10000'),
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0x0b4429576e5ed44a1b8f676c8217eb45707afa3d'],
            ),
          },
        ],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector('depositETH(address,uint256)'),
        valueLimit: LimitUnlimited,
        maxValuePerUse: parseEther('10000'),
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              [sessionSignerAddress],
            ),
          },
        ],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector('deposit(address,address,uint256)'),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 1n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              [sessionSignerAddress],
            ),
          },
        ],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector('withdrawETH(uint256)'),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector('withdraw(address,uint256)'),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector(
          'expire((address,address,uint32,uint64,address,uint96,address,bytes))',
        ),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector(
          'solve((address,address,uint32,uint64,address,uint96,address,bytes),bytes32,bytes)',
        ),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [],
      },
      {
        target: '0x0b4429576e5ed44a1b8f676c8217eb45707afa3d',
        selector: toFunctionSelector(
          'coin((address,address,uint32,uint64,address,uint96,address,bytes),bytes,uint256)',
        ),
        valueLimit: LimitUnlimited,
        maxValuePerUse: 0n,
        constraints: [],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: 0n,
      period: BigInt(0),
    },
    callPolicies: [
      ...[
        toFunctionSelector('sell(uint256,uint256,uint256,uint256)'),
        toFunctionSelector('buy(uint256,uint256,uint256,uint256)'),
        toFunctionSelector('claimWinnings(uint256)'),
      ].map((selector) => ({
        target: '0x4f4988A910f8aE9B3214149A8eA1F2E4e3Cd93CC' as `0x${string}`, // Contract address
        selector, // Allowed function
        valueLimit: {
          limitType: LimitType.Lifetime,
          limit: 0n,
          period: 0n,
        },
        maxValuePerUse: 0n,
        constraints: [],
      })),
      {
        // PTS
        target: '0xf19609e96187cdaa34cffb96473fac567e547302',
        selector: toFunctionSelector('approve(address,uint256) external'),
        valueLimit: {
          limitType: LimitType.Lifetime,
          limit: 0n,
          period: 0n,
        },
        maxValuePerUse: 0n,
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0x4f4988A910f8aE9B3214149A8eA1F2E4e3Cd93CC'],
            ),
          },
        ],
      },
      {
        // PENGU
        target: '0x9ebe3a824ca958e4b3da772d2065518f009cba62',
        selector: toFunctionSelector('approve(address,uint256) external'),
        valueLimit: {
          limitType: LimitType.Lifetime,
          limit: 0n,
          period: 0n,
        },
        maxValuePerUse: 0n,
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0x4f4988A910f8aE9B3214149A8eA1F2E4e3Cd93CC'],
            ),
          },
        ],
      },
      {
        // USDC
        target: '0x84a71ccd554cc1b02749b35d22f684cc8ec987e1',
        selector: toFunctionSelector('approve(address,uint256) external'),
        valueLimit: {
          limitType: LimitType.Lifetime,
          limit: 0n,
          period: 0n,
        },
        maxValuePerUse: 0n,
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: LimitUnlimited,
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0x4f4988A910f8aE9B3214149A8eA1F2E4e3Cd93CC'],
            ),
          },
        ],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: maxInt256,
      period: BigInt(0),
    },
    callPolicies: [
      {
        target: '0x42b2c802205b908030Bc374c1D30Cc4997FC199a',
        selector: toFunctionSelector('buy(address,uint256) external payable'),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: maxInt256,
          period: BigInt(0),
        },
        maxValuePerUse: maxInt256,
        constraints: [],
      },
      {
        target: '0x42b2c802205b908030Bc374c1D30Cc4997FC199a',
        selector: toFunctionSelector(
          'sell(address,uint112,uint112) external payable',
        ),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: maxInt256,
          period: BigInt(0),
        },
        maxValuePerUse: maxInt256,
        constraints: [],
      },
      {
        target: '0x42b2c802205b908030Bc374c1D30Cc4997FC199a',
        selector: toFunctionSelector(
          'deployToken(address,address,string,string,uint256,string,string,bytes32) external payable',
        ),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: maxInt256,
          period: BigInt(0),
        },
        maxValuePerUse: maxInt256,
        constraints: [],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther('30'),
      period: 0n,
    },
    callPolicies: [
      // allow unwrapping eth (winnings)
      {
        target: '0x3439153EB7AF838Ad19d56E1571FBD09333C2809',
        selector: toFunctionSelector('withdraw(uint256)'),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: parseEther('30'),
          period: 0n,
        },
        maxValuePerUse: parseEther('30'),
        constraints: [],
      },
      // allow purchasing tickets with eth
      {
        target: '0x3272596F776470D2D7C3f7dfF3dc50888b7D8967',
        selector: toFunctionSelector(
          'function purchaseETH(uint256,uint16,address,address,uint256,uint256) payable external',
        ),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: parseEther('30'),
          period: 0n,
        },
        maxValuePerUse: parseEther('30'),
        constraints: [],
      },
      // allow claiming tickets
      {
        target: '0x3272596F776470D2D7C3f7dfF3dc50888b7D8967',
        selector: toFunctionSelector(
          'function claim(uint256 poolId) external payable',
        ),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: parseEther('30'),
          period: 0n,
        },
        maxValuePerUse: parseEther('30'),
        constraints: [],
      },
    ],
    transferPolicies: [],
  },
  {
    signer: sessionSignerAddress,
    expiresAt: sessionExpiry,
    feeLimit: {
      limitType: LimitType.Lifetime,
      limit: parseEther('1000000'),
      period: BigInt(60 * 60 * 24),
    },
    callPolicies: [
      {
        target: '0xA27f718c7fB6e5f1eaEb894597143B6b880a3ae9',
        selector: toFunctionSelector(
          'requestTokenSpin(uint8, address, uint256)',
        ),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: parseEther('1000000'),
          period: BigInt(60 * 60 * 24),
        },
        maxValuePerUse: parseEther('1000000'),
        constraints: [],
      },
      {
        target: '0x9ebe3a824ca958e4b3da772d2065518f009cba62',
        selector: toFunctionSelector('approve(address, uint256)'),
        valueLimit: {
          limitType: LimitType.Unlimited,
          limit: parseEther('1000000'),
          period: BigInt(60 * 60 * 24),
        },
        maxValuePerUse: parseEther('1000000'),
        constraints: [
          {
            condition: ConstraintCondition.Equal,
            index: 0n,
            limit: {
              limitType: LimitType.Unlimited,
              limit: parseEther('1000000'),
              period: BigInt(60 * 60 * 24),
            },
            refValue: encodeAbiParameters(
              [{ type: 'address' }],
              ['0xA27f718c7fB6e5f1eaEb894597143B6b880a3ae9'],
            ),
          },
        ],
      },
    ],
    transferPolicies: [],
  },
];

export {
  exampleTypedData,
  sessionApprovalTargetAddress,
  sessionSelector,
  sessionSignerAddress,
  sessionTargetAddress,
  sessionWithConstrainedApprovalCallPolicy,
  sessionWithSimpleCallPolicy,
  sessionWithTransferPolicy,
  sessionWithUnrestrictedApprovalCallPolicy,
};
