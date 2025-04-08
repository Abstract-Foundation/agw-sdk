import { BaseError } from 'abitype';
import {
  type Account,
  type Address,
  type Chain,
  createPublicClient,
  decodeEventLog,
  encodeFunctionData,
  type Hash,
  http,
  type PublicClient,
  type Transport,
  type WalletClient,
} from 'viem';
import { writeContract } from 'viem/actions';
import { getAction, parseAccount } from 'viem/utils';
import { publicActionsL2 } from 'viem/zksync';

import { BridgeHubAbi } from '../abis/BridgeHubAbi.js';
import { DelegateRegistryAbi } from '../abis/DelegateRegistry.js';
import { ZkSyncAbi } from '../abis/ZkSyncAbi.js';
import {
  BASE_GAS_PER_PUBDATA_BYTE,
  BRIDGEHUB_ADDRESS,
  CANONICAL_DELEGATE_REGISTRY_ADDRESS,
  NON_EXPIRING_DELEGATION_RIGHTS,
} from '../constants.js';
import { AccountNotFoundError } from '../errors/account.js';
import { VALID_CHAINS } from '../utils.js';

export interface LinkToAgwParameters {
  agwAddress: Address;
  enabled: boolean;
  l2Chain: Chain;
  account?: Account;
}

export interface LinkToAgwReturnType {
  l1TransactionHash: Hash;
  getL2TransactionHash: () => Promise<Hash>;
}

/**
 * Function to link an Ethereum Mainnet wallet to an Abstract Global Wallet.
 *
 * @example
 * ```tsx
 * import { linkableWalletActions } from "@abstract-foundation/agw-client";
 * import { createWalletClient, custom } from "viem";
 * import { sepolia, abstractTestnet } from "viem/chains";
 *
 * export default function LinkWallet() {
 *   async function linkAgwWallet() {
 *     // Initialize a Viem Wallet client and extend it with linkableWalletActions
 *     const client = createWalletClient({
 *       chain: sepolia,
 *       transport: custom(window.ethereum!),
 *     }).extend(linkableWalletActions());
 *
 *     // Call linkToAgw with the AGW address
 *     const { l1TransactionHash, getL2TransactionHash } =
 *       await client.linkToAgw({
 *         agwAddress: "0x...", // The AGW address to link to
 *         enabled: true, // Enable or disable the link
 *         l2Chain: abstractTestnet,
 *       });
 *
 *     // Get the L2 transaction hash once the L1 transaction is confirmed
 *     const l2Hash = await getL2TransactionHash();
 *   }
 *
 *   return <button onClick={linkAgwWallet}>Link Wallet</button>;
 * }
 * ```
 *
 * @param parameters - Parameters for linking a wallet
 * @param parameters.agwAddress - The address of the Abstract Global Wallet to link to (required)
 * @param parameters.enabled - Whether to enable or disable the link between the wallets (required)
 * @param parameters.l2Chain - The Abstract chain to create the link on (e.g. abstractTestnet) (required)
 * @param parameters.account - The account to use for the transaction
 * @returns Object containing the L1 transaction hash and a function to get the L2 transaction hash
 * @returns.l1TransactionHash - The transaction hash of the L1 transaction that initiated the link
 * @returns.getL2TransactionHash - A function that returns a Promise resolving to the L2 transaction hash once the L1 transaction is confirmed
 */
export async function linkToAgw<
  transport extends Transport = Transport,
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  client: WalletClient<transport, chain, account>,
  parameters: LinkToAgwParameters,
): Promise<LinkToAgwReturnType> {
  const {
    account: account_ = client.account,
    agwAddress,
    enabled,
    l2Chain,
  } = parameters;

  if (!account_) {
    throw new AccountNotFoundError();
  }
  const account = parseAccount(account_);

  if (!VALID_CHAINS[l2Chain.id]) {
    throw new BaseError('Unsupported L2 Chain');
  }

  const bridgehubAddress = BRIDGEHUB_ADDRESS[l2Chain.id] as Address;

  const l1PublicClient = createPublicClient({
    chain: client.chain,
    transport: http(),
  });

  const l2PublicClient = createPublicClient({
    chain: l2Chain,
    transport: http(),
  }).extend(publicActionsL2());

  const l2Value = 0n;
  const operatorTip = 0n;

  const l2Calldata = encodeFunctionData({
    abi: DelegateRegistryAbi,
    functionName: 'delegateAll',
    args: [agwAddress, NON_EXPIRING_DELEGATION_RIGHTS, enabled],
  });

  const l2GasLimit = await l2PublicClient.estimateGasL1ToL2({
    chain: l2PublicClient.chain,
    account: account.address,
    to: CANONICAL_DELEGATE_REGISTRY_ADDRESS,
    data: l2Calldata,
    value: 0n,
  });

  const baseFee = await l1PublicClient.getGasPrice();
  const maxPriorityFeePerGas =
    await l1PublicClient.estimateMaxPriorityFeePerGas();
  const maxFeePerGas = (baseFee * 3n) / 2n + maxPriorityFeePerGas;
  const gasPriceForEstimation = maxFeePerGas;

  const baseCost = await l1PublicClient.readContract({
    address: bridgehubAddress,
    abi: BridgeHubAbi,
    functionName: 'l2TransactionBaseCost',
    args: [
      BigInt(l2PublicClient.chain.id),
      gasPriceForEstimation,
      l2GasLimit,
      BASE_GAS_PER_PUBDATA_BYTE,
    ],
  });

  const l2Costs = baseCost + operatorTip + l2Value;
  const providedValue = l2Costs;

  if (baseCost > providedValue) {
    console.error('Base cost is greater than provided value');
  }

  const bridgeArgs = {
    chainId: BigInt(l2PublicClient.chain.id),
    mintValue: providedValue,
    l2Contract: CANONICAL_DELEGATE_REGISTRY_ADDRESS,
    l2Value,
    l2Calldata,
    l2GasLimit,
    l2GasPerPubdataByteLimit: BASE_GAS_PER_PUBDATA_BYTE,
    factoryDeps: [],
    refundRecipient: agwAddress,
  } as const;

  const l1TransactionHash = await getAction(
    client,
    writeContract,
    'writeContract',
  )({
    abi: BridgeHubAbi,
    address: bridgehubAddress,
    chain: client.chain,
    account,
    functionName: 'requestL2TransactionDirect',
    value: providedValue,
    args: [bridgeArgs],
    maxFeePerGas,
    maxPriorityFeePerGas,
  } as any);

  return {
    l1TransactionHash,
    getL2TransactionHash: async () =>
      getL2HashFromPriorityOp(l1PublicClient, l1TransactionHash),
  };
}

async function getL2HashFromPriorityOp<
  chain extends Chain | undefined = Chain | undefined,
  account extends Account | undefined = Account | undefined,
>(
  publicClient: PublicClient<Transport, chain, account>,
  l1TransactionHash: Hash,
): Promise<Hash> {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: l1TransactionHash,
  });
  if (receipt.status !== 'success') {
    throw new BaseError('L1 transaction failed');
  }
  let hash: Hash | undefined;
  for (const log of receipt.logs) {
    try {
      const priorityQueueLog = decodeEventLog({
        abi: ZkSyncAbi,
        data: log.data,
        topics: log.topics,
        strict: false,
      });
      if (priorityQueueLog && (priorityQueueLog.args as any).txHash !== null)
        hash = (priorityQueueLog.args as any).txHash;
    } catch (_e) {
      // Usually gets here if one of the events is not in the abi which is ok
    }
  }

  if (!hash) {
    throw new BaseError('Error getting L2 hash from L1 transaction');
  }
  return hash;
}
