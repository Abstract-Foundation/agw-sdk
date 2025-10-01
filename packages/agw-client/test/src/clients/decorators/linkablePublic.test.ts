import { describe, expect, it, vi } from 'vitest';
import * as getLinkedAccountsModule from '../../../../src/actions/getLinkedAccounts.js';
import * as getLinkedAgwModule from '../../../../src/actions/getLinkedAgw.js';
import { linkablePublicActions } from '../../../../src/clients/decorators/linkablePublic.js';

// Mock the imported modules
vi.mock('../../../../src/actions/getLinkedAgw');
vi.mock('../../../../src/actions/getLinkedAccounts');

describe('linkablePublicActions', () => {
  const mockPublicClient = {} as any;

  const actions = linkablePublicActions()(mockPublicClient);

  it('should return an object with all expected methods', () => {
    expect(actions).toHaveProperty('getLinkedAgw');
    expect(actions).toHaveProperty('getLinkedAccounts');
  });

  it('should call getLinkedAgw with correct arguments', async () => {
    const mockArgs = {
      address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    };
    await actions.getLinkedAgw(mockArgs as any);
    expect(getLinkedAgwModule.getLinkedAgw).toHaveBeenCalledWith(
      mockPublicClient,
      mockArgs,
    );
  });

  it('should call getLinkedAccounts with correct arguments', async () => {
    const mockArgs = {
      agwAddress: '0xCD2a39F938E13CD947Ec05AbC7FE734Df8DD826',
    };
    await actions.getLinkedAccounts(mockArgs as any);
    expect(getLinkedAccountsModule.getLinkedAccounts).toHaveBeenCalledWith(
      mockPublicClient,
      mockArgs,
    );
  });
});
