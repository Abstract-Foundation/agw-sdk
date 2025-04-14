import { type SessionConfig } from '@abstract-foundation/agw-client/sessions';
import { useMutation } from '@tanstack/react-query';
import type {
  Config,
  ResolvedRegister,
  WriteContractErrorType,
  WriteContractParameters,
} from '@wagmi/core';
import { type Address, type Hex } from 'viem';
import { useConfig } from 'wagmi';
import type { ConfigParameter } from 'wagmi/dist/types/types/properties.js';
import type { UseMutationParameters, UseMutationReturnType } from 'wagmi/query';

import {
  type CreateSessionData,
  type CreateSessionMutate,
  type CreateSessionMutateAsync,
  createSessionMutationOptions,
  type CreateSessionVariables,
} from '../query/createSession.js';

export type CreateSessionArgs = {
  session: SessionConfig;
  paymaster?: Address;
  paymasterData?: Hex;
} & Omit<WriteContractParameters, 'address' | 'abi' | 'functionName' | 'args'>;

export type UseCreateSessionParameters<
  config extends Config = Config,
  context = unknown,
> = ConfigParameter<config> & {
  mutation?:
    | UseMutationParameters<
        CreateSessionData,
        WriteContractErrorType,
        CreateSessionVariables<config, config['chains'][number]['id']>,
        context
      >
    | undefined;
};

export type UseCreateSessionReturnType<
  config extends Config = Config,
  context = unknown,
> = UseMutationReturnType<
  CreateSessionData,
  WriteContractErrorType,
  CreateSessionVariables<config, config['chains'][number]['id']>,
  context
> & {
  createSession: CreateSessionMutate<config, context>;
  createSessionAsync: CreateSessionMutateAsync<config, context>;
};

/**
 * React hook for creating session keys for the Abstract Global Wallet.
 *
 * Sessions enable temporary, permissioned access to a wallet, allowing specific actions
 * to be performed without requiring the wallet owner's signature for each transaction.
 *
 * @param parameters - Optional configuration for the session creation mutation hook
 * @param parameters.mutation - Optional custom mutation parameters
 * @returns Mutation object with the following properties:
 * - `createSession`: Function to create a session
 * - `createSessionAsync`: Promise-based function to create a session
 * - `isPending`: Boolean indicating if a session creation is in progress
 * - `isSuccess`: Boolean indicating if the session was successfully created
 * - `error`: Any error that occurred during session creation
 * - Other standard react-query mutation properties
 *
 * The `createSession` and `createSessionAsync` functions accept two parameters:
 * - `variables`: Object containing:
 *   - `session`: The session configuration object (required)
 *   - `paymaster`: Optional address for gas sponsorship
 *   - `paymasterData`: Optional data for the paymaster
 * - `options`: Standard react-query mutation options (onSuccess, onError, etc.)
 *
 * @example
 * ```tsx
 * import { useCreateSession } from "@abstract-foundation/agw-react";
 * import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
 * import { LimitType } from "@abstract-foundation/agw-client/sessions";
 * import { toFunctionSelector, parseEther } from "viem";
 *
 * export default function CreateSessionExample() {
 *   const { createSessionAsync, isPending, isSuccess, error } = useCreateSession();
 *
 *   async function handleCreateSession() {
 *     const sessionPrivateKey = generatePrivateKey();
 *     const sessionSigner = privateKeyToAccount(sessionPrivateKey);
 *
 *     try {
 *       // First parameter: variables object with session config
 *       const { session, transactionHash } = await createSessionAsync({
 *         session: {
 *           signer: sessionSigner.address,
 *           expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24), // 24 hours
 *           feeLimit: {
 *             limitType: LimitType.Lifetime,
 *             limit: parseEther("1"), // 1 ETH lifetime gas limit
 *             period: BigInt(0),
 *           },
 *           callPolicies: [
 *             {
 *               target: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA", // Contract address
 *               selector: toFunctionSelector("mint(address,uint256)"), // Allowed function
 *               valueLimit: {
 *                 limitType: LimitType.Unlimited,
 *                 limit: BigInt(0),
 *                 period: BigInt(0),
 *               },
 *               maxValuePerUse: BigInt(0),
 *               constraints: [],
 *             }
 *           ],
 *           transferPolicies: [],
 *         },
 *         // Optional paymaster for gas sponsorship
 *         paymaster: "0x1234567890123456789012345678901234567890",
 *       },
 *       // Second parameter: mutation options
 *       {
 *         onSuccess: (data) => console.log("Session created:", data),
 *         onError: (error) => console.error("Session creation failed:", error),
 *       });
 *     } catch (err) {
 *       console.error("Error creating session:", err);
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreateSession} disabled={isPending}>
 *         {isPending ? "Creating..." : "Create Session"}
 *       </button>
 *       {isSuccess && <p>Session created successfully!</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useCreateSession](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useCreateSession)
 *
 * @see {@link createSessionMutationOptions} - The underlying mutation options creator
 */
export function useCreateSession<
  config extends Config = ResolvedRegister['config'],
  context = unknown,
>(
  parameters: UseCreateSessionParameters<config, context> = {},
): UseCreateSessionReturnType<config, context> {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = createSessionMutationOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  type Return = UseCreateSessionReturnType<config, context>;
  return {
    ...result,
    createSession: mutate as Return['createSession'],
    createSessionAsync: mutateAsync as Return['createSessionAsync'],
  };
}
