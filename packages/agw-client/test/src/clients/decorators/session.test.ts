import { describe, expect, it, vi } from 'vitest';
import * as getSessionStatusModule from '../../../../src/actions/getSessionStatus.js';
import * as sendTransactionForSessionModule from '../../../../src/actions/sendTransactionForSession.js';
import * as signTransactionForSessionModule from '../../../../src/actions/signTransactionForSession.js';
import * as signTypedDataModule from '../../../../src/actions/signTypedData.js';

import * as writeContractForSessionModule from '../../../../src/actions/writeContractForSession.js';
import { sessionWalletActions } from '../../../../src/clients/decorators/session.js';
import { address } from '../../../constants.js';
import { emptySession } from '../../../fixtures/sessions.js';
import { sessionSignerAddress } from '../../../fixtures.js';

// Mock the imported modules
vi.mock('../../../../src/actions/sendTransaction');
vi.mock('../../../../src/actions/signTransaction');
vi.mock('../../../../src/actions/deployContract');
vi.mock('../../../../src/actions/writeContract');
vi.mock('../../../../src/actions/prepareTransaction');
vi.mock('../../../../src/actions/writeContractForSession');
vi.mock('../../../../src/actions/sendTransactionForSession');
vi.mock('../../../../src/actions/sendTransactionBatch');
vi.mock('../../../../src/actions/signTransactionBatch');
vi.mock('../../../../src/actions/sendCalls');
vi.mock('../../../../src/actions/getCapabilities');
vi.mock('../../../../src/actions/getCallsStatus');
vi.mock('../../../../src/actions/getLinkedAccounts');
vi.mock('../../../../src/actions/signMessage');
vi.mock('../../../../src/actions/signTypedData');
vi.mock('../../../../src/actions/signTransactionForSession');
vi.mock('../../../../src/actions/getSessionStatus');

describe('sessionWalletActions', () => {
  const mockSignerClient = {
    account: {
      address: sessionSignerAddress,
    },
  } as any;
  const mockPublicClient = {} as any;
  const mockClient = {
    account: {
      address: address.smartAccountAddress,
    },
  } as any;

  const session = emptySession;

  const actions = sessionWalletActions(
    mockSignerClient,
    mockPublicClient,
    session,
  )(mockClient);

  it('should return an object with all expected methods', () => {
    expect(actions).toHaveProperty('writeContract');
    expect(actions).toHaveProperty('sendTransaction');
    expect(actions).toHaveProperty('signTransaction');
    expect(actions).toHaveProperty('signTypedData');
    expect(actions).toHaveProperty('getSessionStatus');
  });

  it('should call sendTransactionForSession with correct arguments', async () => {
    const mockArgs = {
      to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      value: 100n,
    };
    await actions.sendTransaction(mockArgs as any);
    expect(
      sendTransactionForSessionModule.sendTransactionForSession,
    ).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      session,
      undefined,
    );
  });

  it('should call writeContractForSession with correct arguments', async () => {
    const mockArgs = {
      address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      abi: [],
      functionName: 'transfer',
      args: [],
    };
    await actions.writeContract(mockArgs as any);
    expect(
      writeContractForSessionModule.writeContractForSession,
    ).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      session,
      undefined,
    );
  });

  it('should call signTypedDataForSession with correct arguments', async () => {
    const mockArgs = {
      domain: {
        name: 'zkSync',
        version: '2',
        chainId: 11124,
      },
    };
    await actions.signTypedData(mockArgs as any);
    expect(signTypedDataModule.signTypedDataForSession).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      session,
      undefined,
    );
  });

  it('should call signTransactionForSession with correct arguments', async () => {
    const mockArgs = {
      to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      value: 100n,
    };
    await actions.signTransaction(mockArgs as any);
    expect(
      signTransactionForSessionModule.signTransactionForSession,
    ).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      session,
      undefined,
    );
  });

  it('should call getSessionStatus with correct arguments', async () => {
    await actions.getSessionStatus();
    expect(getSessionStatusModule.getSessionStatus).toHaveBeenCalledWith(
      mockPublicClient,
      mockClient.account.address,
      session,
    );
  });
});
