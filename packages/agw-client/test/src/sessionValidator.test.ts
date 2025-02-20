import {
  Address,
  createPublicClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  encodeFunctionData,
  Hex,
} from 'viem';
import { parseAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { describe, expect, it, vi } from 'vitest';

import { SessionKeyPolicyRegistryAbi } from '../../src/abis/SessionKeyPolicyRegistry.js';
import { SessionKeyValidatorAbi } from '../../src/abis/SessionKeyValidator.js';
import {
  SESSION_KEY_POLICY_REGISTRY_ADDRESS,
  SESSION_KEY_VALIDATOR_ADDRESS,
} from '../../src/constants.js';
import { SessionConfig } from '../../src/sessions.js';
import {
  assertSessionKeyPolicies,
  SessionKeyPolicyStatus,
} from '../../src/sessionValidator.js';
import { anvilAbstractMainnet } from '../anvil.js';
import { address } from '../constants.js';
import {
  sessionSelector,
  sessionTargetAddress,
  sessionWithSimpleCallPolicy,
} from '../fixtures.js';

const client = createPublicClient({
  chain: anvilAbstractMainnet.chain as ChainEIP712,
  transport: anvilAbstractMainnet.clientConfig.transport,
});

const encodedPolicyStatus = {
  [SessionKeyPolicyStatus.Unset]: encodeAbiParameters([{ type: 'uint8' }], [0]),
  [SessionKeyPolicyStatus.Allowed]: encodeAbiParameters(
    [{ type: 'uint8' }],
    [1],
  ),
  [SessionKeyPolicyStatus.Denied]: encodeAbiParameters(
    [{ type: 'uint8' }],
    [2],
  ),
};

const getCallPolicy = vi
  .fn()
  .mockReturnValue(encodedPolicyStatus[SessionKeyPolicyStatus.Allowed]);

client.request = (async ({ method, params }) => {
  if (method === 'eth_chainId') {
    return anvilAbstractMainnet.chain.id;
  } else if (method === 'eth_call') {
    const callParams = params as {
      to: Address;
      data: Hex;
    };
    if (callParams.to === SESSION_KEY_POLICY_REGISTRY_ADDRESS) {
      return getCallPolicy(callParams.data);
    }
  }
  return anvilAbstractMainnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

const testCases: {
  desc: string;
  input: {
    session: SessionConfig;
    validationFunction:
      | 'getCallPolicyStatus'
      | 'getTransferPolicyStatus'
      | 'getApprovalTargetStatus';
    validationFunctionArgs: readonly any[];
  };
  allow: boolean;
}[] = [
  {
    desc: 'allowed call policy',
    input: {
      session: sessionWithSimpleCallPolicy,
      validationFunction: 'getCallPolicyStatus',
      validationFunctionArgs: [sessionTargetAddress, sessionSelector],
    },
    allow: true,
  },
];

describe.only('assertSessionKeyPolicies', async () => {
  testCases.forEach(({ desc, input, allow }) => {
    it(`should ${allow ? 'succeed' : 'fail'} for session config with ${desc}`, async () => {
      const transaction = {
        to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
        data: encodeFunctionData({
          abi: SessionKeyValidatorAbi,
          functionName: 'createSession',
          args: [input.session],
        }),
      };

      if (allow) {
        getCallPolicy.mockReturnValue(
          encodedPolicyStatus[SessionKeyPolicyStatus.Allowed],
        );

        await expect(
          assertSessionKeyPolicies(
            client,
            anvilAbstractMainnet.chain.id,
            parseAccount(address.smartAccountAddress),
            transaction,
          ),
        ).resolves.not.toThrow();
      } else {
        getCallPolicy.mockReturnValue(
          encodedPolicyStatus[SessionKeyPolicyStatus.Unset],
        );

        await expect(
          assertSessionKeyPolicies(
            client,
            anvilAbstractMainnet.chain.id,
            parseAccount(address.smartAccountAddress),
            transaction,
          ),
        ).rejects.toThrow();
      }

      expect(getCallPolicy).toHaveBeenCalledWith(
        encodeFunctionData({
          abi: SessionKeyPolicyRegistryAbi,
          functionName: input.validationFunction,
          args: input.validationFunctionArgs as any,
        }),
      );
    });
  });
});
