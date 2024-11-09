import { describe, expect, it, vi } from 'vitest';

import * as deployContractModule from '../../src/actions/deployContract.js';
import * as prepareTransactionRequestModule from '../../src/actions/prepareTransaction.js';
import * as sendTransactionModule from '../../src/actions/sendTransaction.js';
import * as signTransactionModule from '../../src/actions/signTransaction.js';
import * as writeContractModule from '../../src/actions/writeContract.js';
import { globalWalletActions } from '../../src/walletActions.js';
import { address } from '../constants.js';

// Mock the imported modules
vi.mock('../../src/actions/sendTransaction');
vi.mock('../../src/actions/signTransaction');
vi.mock('../../src/actions/deployContract');
vi.mock('../../src/actions/writeContract');
vi.mock('../../src/actions/prepareTransaction');

describe('globalWalletActions', () => {
  const mockSignerClient = {
    account: {
      address: address.signerAddress,
    },
  } as any;
  const mockPublicClient = {} as any;
  const mockClient = {
    account: {
      address: address.smartAccountAddress,
    },
  } as any;

  const actions = globalWalletActions(
    mockSignerClient,
    mockPublicClient,
  )(mockClient);

  it('should return an object with all expected methods', () => {
    expect(actions).toHaveProperty('sendTransaction');
    expect(actions).toHaveProperty('sendTransactionBatch');
    expect(actions).toHaveProperty('signTransaction');
    expect(actions).toHaveProperty('deployContract');
    expect(actions).toHaveProperty('writeContract');
  });

  it('should call sendTransaction with correct arguments', async () => {
    const mockArgs = {
      to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      value: 100n,
    };
    await actions.sendTransaction(mockArgs as any);
    expect(sendTransactionModule.sendTransaction).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      false,
    );
  });

  it('should call sendTransactionBatch with correct arguments', async () => {
    const mockArgs = {
      requests: [
        { to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', value: 100n },
      ],
    };
    await actions.sendTransactionBatch(mockArgs as any);
    expect(sendTransactionModule.sendTransactionBatch).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      false,
    );
  });

  it('should call signTransaction with correct arguments', async () => {
    const mockArgs = {
      to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      value: 100n,
    };
    await actions.signTransaction(mockArgs as any);
    expect(signTransactionModule.signTransaction).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockArgs,
    );
  });

  it('should call deployContract with correct arguments', async () => {
    const mockArgs = { abi: [], bytecode: '0x' };
    await actions.deployContract(mockArgs as any);
    expect(deployContractModule.deployContract).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      false,
    );
  });

  it('should call writeContract with correct arguments', async () => {
    const mockArgs = {
      address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      abi: [],
      functionName: 'transfer',
      args: [],
    };
    await actions.writeContract(mockArgs as any);
    expect(writeContractModule.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        sendTransaction: expect.any(Function),
      }),
      mockSignerClient,
      mockPublicClient,
      mockArgs,
    );
  });

  it('should call prepareTransaction with correct arguments', async () => {
    const mockArgs = {
      to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      value: 100n,
      isInitialTransaction: true,
    };
    await actions.prepareAbstractTransactionRequest(mockArgs as any);
    expect(
      prepareTransactionRequestModule.prepareTransactionRequest,
    ).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
    );
  });
});
