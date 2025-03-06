import type { Address, PublicClient, Transport } from 'viem';
import type { ChainEIP712 } from 'viem/chains';

import { FeatureFlagRegistryAbi } from './abis/FeatureFlagRegistryAbi.js';
import { FEATURE_FLAG_REGISTRY_ADDRESS } from './constants.js';

export async function isFeatureFlagEnabled(
  client: PublicClient<Transport, ChainEIP712>,
  account: Address,
  featureFlag: string,
) {
  try {
    const enabled = await client.readContract({
      address: FEATURE_FLAG_REGISTRY_ADDRESS,
      abi: FeatureFlagRegistryAbi,
      functionName: 'isFeatureFlagEnabled',
      args: [featureFlag, account],
    });

    return enabled;
  } catch (error) {
    // if flag status can not be determined, default to disabled to
    // ensure the flow is not blocked
    console.error(error);
    return false;
  }
}
