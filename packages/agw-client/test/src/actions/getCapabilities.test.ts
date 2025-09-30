import { createClient } from 'viem';
import {
  abstract,
  abstractTestnet,
  zksync,
  zksyncSepoliaTestnet,
} from 'viem/chains';
import { ChainEIP712 } from 'viem/zksync';
import { describe, expect, it } from 'vitest';

import { getCapabilities } from '../../../src/actions/getCapabilities.js';
import { agwCapabilities } from '../../../src/eip5792.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

describe('getCapabilities', () => {
  it('should return capabilities for all supported chains when no chainId is provided', async () => {
    const capabilities = await getCapabilities(baseClient);

    expect(capabilities).toEqual({
      [abstractTestnet.id]: agwCapabilities,
      [abstract.id]: agwCapabilities,
      [zksync.id]: agwCapabilities,
      [zksyncSepoliaTestnet.id]: agwCapabilities,
    });
  });

  it('should return capabilities for a specific chainId when provided', async () => {
    const capabilities = await getCapabilities(baseClient, {
      chainId: abstractTestnet.id,
    });

    expect(capabilities).toEqual(agwCapabilities);
  });

  it('should return capabilities for abstract mainnet', async () => {
    const capabilities = await getCapabilities(baseClient, {
      chainId: abstract.id,
    });

    expect(capabilities).toEqual(agwCapabilities);
  });

  it('should return capabilities for zksync', async () => {
    const capabilities = await getCapabilities(baseClient, {
      chainId: zksync.id,
    });

    expect(capabilities).toEqual(agwCapabilities);
  });

  it('should return capabilities for zksync sepolia testnet', async () => {
    const capabilities = await getCapabilities(baseClient, {
      chainId: zksyncSepoliaTestnet.id,
    });

    expect(capabilities).toEqual(agwCapabilities);
  });

  it('should throw UnsupportedChainIdError for unsupported chainId', async () => {
    await expect(
      getCapabilities(baseClient, {
        chainId: 999999,
      }),
    ).rejects.toThrow('Chain 999999 not supported');
  });
});
