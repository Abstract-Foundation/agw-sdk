import {
  encodeAbiParameters,
  toFunctionSelector,
  TypedDataDefinition,
} from 'viem';

import {
  ConstraintCondition,
  LimitType,
  LimitUnlimited,
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

export {
  exampleTypedData,
  sessionApprovalTargetAddress,
  sessionSelector,
  sessionSignerAddress,
  sessionTargetAddress,
  sessionWithConstrainedApprovalCallPolicy,
  sessionWithSimpleCallPolicy,
  sessionWithUnrestrictedApprovalCallPolicy,
};
