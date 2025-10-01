import {
  type Account,
  BaseError,
  type Chain,
  type Client,
  type PublicClient,
  type SendCallsParameters,
  type SendCallsReturnType,
  type Transport,
  UnsupportedNonOptionalCapabilityError,
  type WalletClient,
} from 'viem';
import { type ChainEIP712 } from 'viem/zksync';
import { agwCapabilities } from '../eip5792.js';
import type { CustomPaymasterHandler } from '../types/customPaymaster.js';
import { sendTransactionBatch } from './sendTransactionBatch.js';

/**
 * Requests the connected wallet to send a batch of calls.
 *
 * - Docs: https://viem.sh/docs/actions/wallet/sendCalls
 * - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
 *
 * @param client - Client to use
 * @returns Transaction identifier. {@link SendCallsReturnType}
 *
 * @example
 * import { createWalletClient, custom } from 'viem'
 * import { mainnet } from 'viem/chains'
 * import { sendCalls } from 'viem/actions'
 *
 * const client = createWalletClient({
 *   chain: mainnet,
 *   transport: custom(window.ethereum),
 * })
 * const id = await sendCalls(client, {
 *   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
 *   calls: [
 *     {
 *       data: '0xdeadbeef',
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *     },
 *     {
 *       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
 *       value: 69420n,
 *     },
 *   ],
 * })
 */
export async function sendCalls<
  const calls extends readonly unknown[],
  chain extends Chain | undefined,
  account extends Account | undefined = undefined,
  chainOverride extends Chain | undefined = undefined,
>(
  client: Client<Transport, ChainEIP712, Account>,
  signerClient: WalletClient<Transport, ChainEIP712, Account>,
  publicClient: PublicClient<Transport, ChainEIP712>,
  parameters: SendCallsParameters<chain, account, chainOverride, calls>,
  isPrivyCrossApp = false,
  customPaymasterHandler: CustomPaymasterHandler | undefined = undefined,
): Promise<SendCallsReturnType> {
  const { calls, capabilities } = parameters;

  if (capabilities) {
    const nonOptionalCapabilities = Object.entries(capabilities).filter(
      ([_, capability]) => !capability.optional,
    );
    for (const [capability] of nonOptionalCapabilities) {
      if (!agwCapabilities[capability]) {
        const message = `non-optional capability ${capability} is not supported`;
        throw new UnsupportedNonOptionalCapabilityError(
          new BaseError(message, {
            details: message,
          }),
        );
      }
    }
  }

  const result = await sendTransactionBatch(
    client,
    signerClient,
    publicClient,
    {
      calls,
    },
    isPrivyCrossApp,
    customPaymasterHandler,
  );

  return {
    id: result,
  };
}
