import { createClient, getAddress } from 'viem';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getLinkedAgw } from '../../../src/actions/getLinkedAgw.js';
import {
  AGW_LINK_DELEGATION_RIGHTS,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
} from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('viem/actions', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as object),
    readContract: vi.fn(),
  };
});

import { readContract } from 'viem/actions';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('getLinkedAgw', () => {
  it('uses the connected account when parameters are omitted', async () => {
    const linkedAgw = '0x1234567890123456789012345678901234567890';
    vi.mocked(readContract).mockResolvedValue(linkedAgw);

    const result = await getLinkedAgw(baseClient);

    expect(readContract).toHaveBeenCalledWith(baseClient, {
      abi: expect.any(Array),
      address: CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
      functionName: 'exclusiveWalletByRights',
      args: [
        getAddress(address.smartAccountAddress),
        AGW_LINK_DELEGATION_RIGHTS,
      ],
    });
    expect(result).toEqual({ agw: linkedAgw });
  });
});
