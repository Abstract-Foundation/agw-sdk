import { describe, expect, it, vi } from 'vitest';
import * as getLinkedAgwModule from '../../../../src/actions/getLinkedAgw.js';
import * as linkToAgwModule from '../../../../src/actions/linkToAgw.js';
import { linkableWalletActions } from '../../../../src/clients/decorators/linkableWallet.js';

// Mock the imported modules
vi.mock('../../../../src/actions/getLinkedAgw');
vi.mock('../../../../src/actions/linkToAgw');

describe('linkableWalletActions', () => {
  const mockWalletClient = {} as any;

  const actions = linkableWalletActions()(mockWalletClient);

  it('should return an object with all expected methods', () => {
    expect(actions).toHaveProperty('linkToAgw');
    expect(actions).toHaveProperty('getLinkedAgw');
  });

  it('should call linkToAgw with correct arguments', async () => {
    const mockArgs = {
      agwAddress: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    };
    await actions.linkToAgw(mockArgs as any);
    expect(linkToAgwModule.linkToAgw).toHaveBeenCalledWith(
      mockWalletClient,
      mockArgs,
    );
  });

  it('should call getLinkedAgw with correct arguments', async () => {
    await actions.getLinkedAgw();
    expect(getLinkedAgwModule.getLinkedAgw).toHaveBeenCalledWith(
      mockWalletClient,
      {},
    );
  });
});
