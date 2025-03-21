import {
  type Account,
  BaseError,
  type PublicClient,
  toFunctionSelector,
  type Transport,
} from 'viem';
import { abstract } from 'viem/chains';
import { decodeAbiParameters, decodeFunctionData } from 'viem/utils';
import type { ChainEIP712, SignEip712TransactionParameters } from 'viem/zksync';

import { SessionKeyPolicyRegistryAbi } from './abis/SessionKeyPolicyRegistry.js';
import { SessionKeyValidatorAbi } from './abis/SessionKeyValidator.js';
import {
  SESSION_KEY_POLICY_REGISTRY_ADDRESS,
  SESSION_KEY_VALIDATOR_ADDRESS,
} from './constants.js';
import { AGWAccountAbi } from './exports/constants.js';
import { ConstraintCondition, getSessionSpec } from './sessions.js';

const restrictedSelectors = new Set<string>([
  toFunctionSelector('function setApprovalForAll(address, bool)'),
  toFunctionSelector('function approve(address, uint256)'),
  toFunctionSelector('function transfer(address, uint256)'),
]);

export enum SessionKeyPolicyStatus {
  Unset = 0,
  Allowed = 1,
  Denied = 2,
}

export async function assertSessionKeyPolicies<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account = Account,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  client: PublicClient<Transport, ChainEIP712>,
  chainId: number,
  account: account,
  transaction: Omit<
    SignEip712TransactionParameters<chain, account, chainOverride>,
    'account' | 'chain'
  >,
) {
  // Only validate on Abstract mainnet
  if (chainId !== abstract.id) {
    return;
  }

  const session = getSessionFromTransaction(account, transaction);

  if (!session) {
    // no session can be parsed from the transaction
    return;
  }

  const callPolicies = session.callPolicies;
  const transferPolicies = session.transferPolicies;

  const checks = [];

  for (const callPolicy of callPolicies) {
    if (restrictedSelectors.has(callPolicy.selector)) {
      const destinationConstraints = callPolicy.constraints.filter(
        (c) => c.index === 0n && c.condition === ConstraintCondition.Equal,
      );

      if (destinationConstraints.length === 0) {
        throw new BaseError(
          `Unconstrained token approval/transfer destination in call policy. Selector: ${callPolicy.selector}; Target: ${callPolicy.target}`,
        );
      }

      for (const constraint of destinationConstraints) {
        const [target] = decodeAbiParameters(
          [
            {
              type: 'address',
            },
          ],
          constraint.refValue,
        );

        checks.push({
          target,
          check: {
            address: SESSION_KEY_POLICY_REGISTRY_ADDRESS,
            abi: SessionKeyPolicyRegistryAbi,
            functionName: 'getApprovalTargetStatus',
            args: [
              callPolicy.target, // token address
              target, // allowed spender
            ],
          },
        });
      }
    } else {
      checks.push({
        target: callPolicy.target,
        check: {
          address: SESSION_KEY_POLICY_REGISTRY_ADDRESS,
          abi: SessionKeyPolicyRegistryAbi,
          functionName: 'getCallPolicyStatus',
          args: [callPolicy.target, callPolicy.selector],
        },
      });
    }
  }

  for (const transferPolicy of transferPolicies) {
    checks.push({
      target: transferPolicy.target,
      check: {
        address: SESSION_KEY_POLICY_REGISTRY_ADDRESS,
        abi: SessionKeyPolicyRegistryAbi,
        functionName: 'getTransferPolicyStatus',
        args: [transferPolicy.target],
      },
    });
  }

  const results = await client.multicall({
    contracts: checks.map((c) => c.check),
    allowFailure: false,
  });

  for (let i = 0; i < checks.length; i++) {
    const result = results[i];
    const check = checks[i];

    if (Number(result) !== SessionKeyPolicyStatus.Allowed) {
      throw new BaseError(
        `Session key policy violation. Target: ${check?.target}; Status: ${SessionKeyPolicyStatus[Number(result)]}`,
      );
    }
  }
}

function getSessionFromTransaction<
  chain extends ChainEIP712 | undefined = ChainEIP712 | undefined,
  account extends Account | undefined = Account | undefined,
  chainOverride extends ChainEIP712 | undefined = ChainEIP712 | undefined,
>(
  account: account,
  transaction: Omit<
    SignEip712TransactionParameters<chain, account, chainOverride>,
    'account' | 'chain'
  >,
) {
  if (
    transaction.to === SESSION_KEY_VALIDATOR_ADDRESS &&
    transaction.data?.substring(0, 10) === '0x5a0694d2' // createSession(SessionLib.SessionSpec memory sessionSpec)
  ) {
    const sessionSpec = decodeFunctionData({
      abi: SessionKeyValidatorAbi,
      data: transaction.data,
    });
    if (sessionSpec.functionName === 'createSession') {
      return sessionSpec.args[0];
    }
  }

  if (
    transaction.to === account?.address &&
    transaction.data?.substring(0, 10) === '0xd3bdf4b5' // addModule(bytes moduleAndData)
  ) {
    const moduleAndData = decodeFunctionData({
      abi: AGWAccountAbi,
      data: transaction.data,
    });
    if (
      moduleAndData.functionName === 'addModule' &&
      moduleAndData.args[0]
        .toLowerCase()
        .startsWith(SESSION_KEY_VALIDATOR_ADDRESS.toLowerCase())
    ) {
      // Remove '0x' prefix (2 chars) + validator address 20 bytes (40 chars)
      const sessionData = moduleAndData.args[0].substring(42);

      return decodeAbiParameters([getSessionSpec()], `0x${sessionData}`)[0];
    }
  }

  return undefined;
}
