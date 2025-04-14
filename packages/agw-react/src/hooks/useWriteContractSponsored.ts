import type { Abi, WriteContractErrorType } from 'viem';
import { type Config, type ResolvedRegister, useConfig } from 'wagmi';
import type { ConfigParameter } from 'wagmi/dist/types/types/properties';
import {
  useMutation,
  type UseMutationParameters,
  type UseMutationReturnType,
  type WriteContractData,
} from 'wagmi/query';

import {
  type WriteContractSponsoredMutate,
  type WriteContractSponsoredMutateAsync,
  writeContractSponsoredMutationOptions,
  type WriteContractSponsoredVariables,
} from '../query/writeContractSponsored.js';

export type UseWriteContractSponsoredParameters<
  config extends Config = Config,
  context = unknown,
> = ConfigParameter<config> & {
  mutation?:
    | UseMutationParameters<
        WriteContractData,
        WriteContractErrorType,
        WriteContractSponsoredVariables<
          Abi,
          string,
          readonly unknown[],
          config,
          config['chains'][number]['id']
        >,
        context
      >
    | undefined;
};

export type UseWriteContractSponsoredReturnType<
  config extends Config = Config,
  context = unknown,
> = UseMutationReturnType<
  WriteContractData,
  WriteContractErrorType,
  WriteContractSponsoredVariables<
    Abi,
    string,
    readonly unknown[],
    config,
    config['chains'][number]['id']
  >,
  context
> & {
  writeContractSponsored: WriteContractSponsoredMutate<config, context>;
  writeContractSponsoredAsync: WriteContractSponsoredMutateAsync<
    config,
    context
  >;
};

/**
 * React hook for interacting with smart contracts using paymasters to cover gas fees.
 *
 * This hook enables you to initiate transactions on smart contracts with the gas fees
 * sponsored by a paymaster, allowing users to interact with contracts without needing
 * to pay for gas themselves.
 *
 * Under the hood, it uses wagmi's `useMutation` hook with custom mutation options
 * for sponsored transactions.
 *
 * @param parameters - Optional configuration for the sponsored contract interaction
 * @param parameters.mutation - Optional custom mutation parameters
 * @returns An object containing functions and state for executing sponsored contract interactions:
 * - `writeContractSponsored`: Function to execute a sponsored contract call
 * - `writeContractSponsoredAsync`: Promise-based function to execute a sponsored contract call
 * - `data`: The transaction hash when successful
 * - `error`: Error object if the transaction failed
 * - `isSuccess`, `isPending`, `isError`: Status indicators
 * - Other standard wagmi mutation properties
 *
 * @example
 * ```tsx
 * import { useWriteContractSponsored } from "@abstract-foundation/agw-react";
 * import { getGeneralPaymasterInput } from "viem/zksync";
 * import { parseEther } from "viem";
 *
 * // Example contract ABI (simplified)
 * const contractAbi = [
 *   {
 *     name: "mint",
 *     type: "function",
 *     inputs: [
 *       { name: "to", type: "address" },
 *       { name: "tokenId", type: "uint256" }
 *     ],
 *     outputs: [],
 *     stateMutability: "nonpayable"
 *   }
 * ];
 *
 * export default function SponsoredTransaction() {
 *   const {
 *     writeContractSponsored,
 *     writeContractSponsoredAsync,
 *     data,
 *     error,
 *     isSuccess,
 *     isPending
 *   } = useWriteContractSponsored();
 *
 *   const handleMint = async () => {
 *     try {
 *       // Execute a contract write without requiring the user to pay gas
 *       await writeContractSponsoredAsync({
 *         abi: contractAbi,
 *         address: "0xC4822AbB9F05646A9Ce44EFa6dDcda0Bf45595AA", // Contract address
 *         functionName: "mint",
 *         args: ["0x273B3527BF5b607dE86F504fED49e1582dD2a1C6", BigInt(1)],
 *         // Paymaster configuration
 *         paymaster: "0x5407B5040dec3D339A9247f3654E59EEccbb6391",
 *         paymasterInput: getGeneralPaymasterInput({
 *           innerInput: "0x",
 *         }),
 *       });
 *       console.log("Transaction submitted successfully");
 *     } catch (err) {
 *       console.error("Transaction failed:", err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button
 *         onClick={handleMint}
 *         disabled={isPending}
 *       >
 *         {isPending ? "Processing..." : "Mint with Sponsored Gas"}
 *       </button>
 *
 *       {isSuccess && (
 *         <div className="success">
 *           Transaction Hash: {data}
 *         </div>
 *       )}
 *
 *       {error && (
 *         <div className="error">
 *           Error: {error.message}
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * Read more: [Abstract docs: useWriteContractSponsored](https://docs.abs.xyz/abstract-global-wallet/agw-react/hooks/useWriteContractSponsored)
 *
 * @see {@link useMutation} - The underlying wagmi hook
 * @see {@link writeContractSponsoredMutationOptions} - The options creator for the sponsored mutation
 */
export function useWriteContractSponsored<
  config extends Config = ResolvedRegister['config'],
  context = unknown,
>(
  parameters: UseWriteContractSponsoredParameters<config, context> = {},
): UseWriteContractSponsoredReturnType<config, context> {
  const { mutation } = parameters;

  const config = useConfig(parameters);

  const mutationOptions = writeContractSponsoredMutationOptions(config);
  const { mutate, mutateAsync, ...result } = useMutation({
    ...mutation,
    ...mutationOptions,
  });

  type Return = UseWriteContractSponsoredReturnType<config, context>;
  return {
    ...result,
    writeContractSponsored: mutate as Return['writeContractSponsored'],
    writeContractSponsoredAsync:
      mutateAsync as Return['writeContractSponsoredAsync'],
  };
}
