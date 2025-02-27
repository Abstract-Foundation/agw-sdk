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
  sessionWithConstrainedApprovalCallPolicy,
  sessionWithSimpleCallPolicy,
  sessionWithTransferPolicy,
  sessionWithUnrestrictedApprovalCallPolicy,
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

client.multicall = vi.fn().mockResolvedValue(['1']);

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

const simpleSessionTestCases: {
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
  {
    desc: 'constrained approval call policy',
    input: {
      session: sessionWithConstrainedApprovalCallPolicy,
      validationFunction: 'getCallPolicyStatus',
      validationFunctionArgs: [sessionTargetAddress, sessionSelector],
    },
    allow: true,
  },
  {
    desc: 'unrestricted approval call policy',
    input: {
      session: sessionWithUnrestrictedApprovalCallPolicy,
      validationFunction: 'getCallPolicyStatus',
      validationFunctionArgs: [sessionTargetAddress, sessionSelector],
    },
    allow: false,
  },
];

describe('assertSessionKeyPolicies', async () => {
  simpleSessionTestCases.forEach(({ desc, input, allow }) => {
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
    });
  });

  it('should return early when no session can be parsed from the transaction', async () => {
    const transaction = {
      to: '0x1234567890123456789012345678901234567890' as Address,
      data: '0x12345678' as Hex,
    };

    // Reset the multicall mock to track if it gets called
    client.multicall = vi.fn().mockResolvedValue(['1']);

    await expect(
      assertSessionKeyPolicies(
        client,
        anvilAbstractMainnet.chain.id,
        parseAccount(address.smartAccountAddress),
        transaction,
      ),
    ).resolves.not.toThrow();

    // Verify that multicall was not called since we returned early
    expect(client.multicall).not.toHaveBeenCalled();
  });

  // Test for transfer policies validation
  it('should validate transfer policies correctly', async () => {
    const transaction = {
      to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [sessionWithTransferPolicy],
      }),
    };

    getCallPolicy.mockReturnValue(
      encodedPolicyStatus[SessionKeyPolicyStatus.Allowed],
    );

    // Reset the multicall mock to track if it gets called with the right arguments
    client.multicall = vi.fn().mockResolvedValue(['1']);

    await expect(
      assertSessionKeyPolicies(
        client,
        anvilAbstractMainnet.chain.id,
        parseAccount(address.smartAccountAddress),
        transaction,
      ),
    ).resolves.not.toThrow();

    // Verify that multicall was called with the correct arguments
    expect(client.multicall).toHaveBeenCalledWith(
      expect.objectContaining({
        contracts: expect.arrayContaining([
          expect.objectContaining({
            functionName: 'getTransferPolicyStatus',
            args: [sessionTargetAddress],
          }),
        ]),
      }),
    );
  });

  it('should throw when policy status is not allowed', async () => {
    const transaction = {
      to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [sessionWithTransferPolicy],
      }),
    };

    // Mock multicall to return a non-allowed status
    client.multicall = vi
      .fn()
      .mockResolvedValue([SessionKeyPolicyStatus.Denied.toString()]) as any;

    await expect(
      assertSessionKeyPolicies(
        client,
        anvilAbstractMainnet.chain.id,
        parseAccount(address.smartAccountAddress),
        transaction,
      ),
    ).rejects.toThrow('Session key policy violation');
  });

  it('should validate all predefined session configurations', async () => {
    const { sessionTests } = await import('../fixtures.js');

    for (const sessionConfig of sessionTests) {
      const transaction = {
        to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
        data: encodeFunctionData({
          abi: SessionKeyValidatorAbi,
          functionName: 'createSession',
          args: [sessionConfig],
        }),
      };

      // Mock the policy status to be allowed for this test
      getCallPolicy.mockReturnValue(
        encodedPolicyStatus[SessionKeyPolicyStatus.Allowed],
      );

      // Reset the multicall mock to return allowed status for all calls
      client.multicall = vi
        .fn()
        .mockResolvedValue(
          Array(
            (sessionConfig.callPolicies?.length || 0) +
              (sessionConfig.transferPolicies?.length || 0),
          ).fill(SessionKeyPolicyStatus.Allowed.toString()),
        );

      // Test that the session configuration is valid
      await expect(
        assertSessionKeyPolicies(
          client,
          anvilAbstractMainnet.chain.id,
          parseAccount(address.smartAccountAddress),
          transaction,
        ),
      ).resolves.not.toThrow();
    }
  });

  it('should detect policy violations in session configurations', async () => {
    const { sessionTests } = await import('../fixtures.js');

    const sessionConfig = sessionTests[0];

    const transaction = {
      to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [sessionConfig],
      }),
    };

    getCallPolicy.mockReturnValue(
      encodedPolicyStatus[SessionKeyPolicyStatus.Denied],
    );

    client.multicall = vi
      .fn()
      .mockResolvedValue([SessionKeyPolicyStatus.Denied.toString()]);

    await expect(
      assertSessionKeyPolicies(
        client,
        anvilAbstractMainnet.chain.id,
        parseAccount(address.smartAccountAddress),
        transaction,
      ),
    ).rejects.toThrow('Session key policy violation');
  });

  it('should detect mixed policy statuses correctly', async () => {
    const { sessionTests } = await import('../fixtures.js');

    // Find a session with multiple policies
    const sessionConfig =
      sessionTests.find(
        (s) =>
          (s.callPolicies?.length || 0) + (s.transferPolicies?.length || 0) > 1,
      ) || sessionTests[0];

    const transaction = {
      to: SESSION_KEY_VALIDATOR_ADDRESS as Address,
      data: encodeFunctionData({
        abi: SessionKeyValidatorAbi,
        functionName: 'createSession',
        args: [sessionConfig],
      }),
    };

    // Mock the policy status to be allowed for eth_call
    getCallPolicy.mockReturnValue(
      encodedPolicyStatus[SessionKeyPolicyStatus.Allowed],
    );

    // Mock multicall to return mixed statuses (first allowed, second denied)
    const statuses = Array(
      (sessionConfig.callPolicies?.length || 0) +
        (sessionConfig.transferPolicies?.length || 0),
    ).fill(SessionKeyPolicyStatus.Allowed.toString());

    // Set the second policy to be denied
    if (statuses.length > 1) {
      statuses[1] = SessionKeyPolicyStatus.Denied.toString();
    }

    client.multicall = vi.fn().mockResolvedValue(statuses);

    // Test that the session validation throws an error
    await expect(
      assertSessionKeyPolicies(
        client,
        anvilAbstractMainnet.chain.id,
        parseAccount(address.smartAccountAddress),
        transaction,
      ),
    ).rejects.toThrow('Session key policy violation');
  });
});
