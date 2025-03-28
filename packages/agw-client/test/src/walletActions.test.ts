import { parseEther } from 'viem';
import { describe, expect, it, vi } from 'vitest';

import * as deployContractModule from '../../src/actions/deployContract.js';
import * as prepareTransactionRequestModule from '../../src/actions/prepareTransaction.js';
import * as sendTransactionModule from '../../src/actions/sendTransaction.js';
import * as sendTransactionBatchModule from '../../src/actions/sendTransactionBatch.js';
import * as sendTransactionForSessionModule from '../../src/actions/sendTransactionForSession.js';
import * as signTransactionModule from '../../src/actions/signTransaction.js';
import * as writeContractModule from '../../src/actions/writeContract.js';
import * as writeContractForSessionModule from '../../src/actions/writeContractForSession.js';
import { EOA_VALIDATOR_ADDRESS } from '../../src/constants.js';
import { LimitType, SessionConfig } from '../../src/sessions.js';
import {
  globalWalletActions,
  sessionWalletActions,
} from '../../src/walletActions.js';
import { address } from '../constants.js';

// Mock the imported modules
vi.mock('../../src/actions/sendTransaction');
vi.mock('../../src/actions/signTransaction');
vi.mock('../../src/actions/deployContract');
vi.mock('../../src/actions/writeContract');
vi.mock('../../src/actions/prepareTransaction');
vi.mock('../../src/actions/writeContractForSession');
vi.mock('../../src/actions/sendTransactionForSession');
vi.mock('../../src/actions/sendTransactionBatch');

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
      undefined,
    );
  });

  it('should call sendTransactionBatch with correct arguments', async () => {
    const mockArgs = {
      requests: [
        { to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', value: 100n },
      ],
    };
    await actions.sendTransactionBatch(mockArgs as any);
    expect(
      sendTransactionBatchModule.sendTransactionBatch,
    ).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      false,
      undefined,
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
      mockPublicClient,
      mockArgs,
      EOA_VALIDATOR_ADDRESS,
      {},
      undefined,
      false,
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
      false,
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

describe('sessionWalletActions', () => {
  const mockSignerClient = {
    account: {
      address: address.sessionSignerAddress,
    },
  } as any;
  const mockPublicClient = {} as any;
  const mockClient = {
    account: {
      address: address.smartAccountAddress,
    },
  } as any;

  const session: SessionConfig = {
    signer: mockSignerClient.account.address,
    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
    feeLimit: {
      limit: parseEther('1'),
      limitType: LimitType.Lifetime,
      period: 0n,
    },
    callPolicies: [],
    transferPolicies: [],
  };

  const actions = sessionWalletActions(
    mockSignerClient,
    mockPublicClient,
    session,
  )(mockClient);

  it('should return an object with all expected methods', () => {
    expect(actions).toHaveProperty('writeContract');
    expect(actions).toHaveProperty('sendTransaction');
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
});
