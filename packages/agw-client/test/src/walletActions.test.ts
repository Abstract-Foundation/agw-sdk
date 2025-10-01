import { parseEther } from 'viem';
import { parseAccount } from 'viem/accounts';
import { describe, expect, it, vi } from 'vitest';
import * as deployContractModule from '../../src/actions/deployContract.js';
import * as getCallsStatusModule from '../../src/actions/getCallsStatus.js';
import * as getCapabilitiesModule from '../../src/actions/getCapabilities.js';
import * as getLinkedAccountsModule from '../../src/actions/getLinkedAccounts.js';
import * as getSessionStatusModule from '../../src/actions/getSessionStatus.js';
import * as prepareTransactionRequestModule from '../../src/actions/prepareTransaction.js';
import * as sendCallsModule from '../../src/actions/sendCalls.js';
import * as sendTransactionModule from '../../src/actions/sendTransaction.js';
import * as sendTransactionBatchModule from '../../src/actions/sendTransactionBatch.js';
import * as sendTransactionForSessionModule from '../../src/actions/sendTransactionForSession.js';
import * as signMessageModule from '../../src/actions/signMessage.js';
import * as signTransactionModule from '../../src/actions/signTransaction.js';
import * as signTransactionBatchModule from '../../src/actions/signTransactionBatch.js';
import * as signTransactionForSessionModule from '../../src/actions/signTransactionForSession.js';
import * as signTypedDataModule from '../../src/actions/signTypedData.js';
import * as writeContractModule from '../../src/actions/writeContract.js';
import * as writeContractForSessionModule from '../../src/actions/writeContractForSession.js';
import { globalWalletActions } from '../../src/clients/decorators/abstract.js';
import { sessionWalletActions } from '../../src/clients/decorators/session.js';
import { EOA_VALIDATOR_ADDRESS } from '../../src/constants.js';
import { LimitType, SessionConfig } from '../../src/sessions.js';
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
vi.mock('../../src/actions/signTransactionBatch');
vi.mock('../../src/actions/sendCalls');
vi.mock('../../src/actions/getCapabilities');
vi.mock('../../src/actions/getCallsStatus');
vi.mock('../../src/actions/getLinkedAccounts');
vi.mock('../../src/actions/signMessage');
vi.mock('../../src/actions/signTypedData');
vi.mock('../../src/actions/signTransactionForSession');
vi.mock('../../src/actions/getSessionStatus');

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
    expect(actions).toHaveProperty('getCapabilities');
    expect(actions).toHaveProperty('getCallsStatus');
    expect(actions).toHaveProperty('sendCalls');
    expect(actions).toHaveProperty('showCallsStatus');
    expect(actions).toHaveProperty('getLinkedAccounts');
    expect(actions).toHaveProperty('signMessage');
    expect(actions).toHaveProperty('getSessionStatus');
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
      calls: [
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

  it('should call signTransactionBatch with correct arguments', async () => {
    const mockArgs = {
      calls: [
        { to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', value: 100n },
      ],
    };
    await actions.signTransactionBatch(mockArgs as any);
    expect(
      signTransactionBatchModule.signTransactionBatch,
    ).toHaveBeenCalledWith(
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

  it('should call getCapabilities with correct arguments', async () => {
    const mockArgs = {
      account: parseAccount('0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'),
      chainId: 11124,
    };
    await actions.getCapabilities(mockArgs);
    expect(getCapabilitiesModule.getCapabilities).toHaveBeenCalledWith(
      mockClient,
      mockArgs,
    );
  });

  it('should call getCallsStatus with correct arguments', async () => {
    await actions.getCallsStatus({ id: '1' });
    expect(getCallsStatusModule.getCallsStatus).toHaveBeenCalledWith(
      mockPublicClient,
      { id: '1' },
    );
  });

  it('should call sendCalls with correct arguments', async () => {
    const mockArgs = {
      calls: [
        { to: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', value: 100n },
      ],
    };
    await actions.sendCalls(mockArgs as any);
    expect(sendCallsModule.sendCalls).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockPublicClient,
      mockArgs,
      false,
      undefined,
    );
  });

  it('should call call getLinkedAccounts with correct arguments', async () => {
    await actions.getLinkedAccounts();
    expect(getLinkedAccountsModule.getLinkedAccounts).toHaveBeenCalledWith(
      mockClient,
      { agwAddress: address.smartAccountAddress },
    );
  });

  it('should return a resolved promise when showCallsStatus is called', async () => {
    const result = actions.showCallsStatus({ id: '1' });
    expect(result).toBeInstanceOf(Promise);
    expect(result).resolves.toBeUndefined();
  });

  it('should call signMessage with correct arguments', async () => {
    const mockArgs = {
      message: '0xCD2a39F938E13CD947Ec05AbC7FE734Df8DD826',
    };
    await actions.signMessage(mockArgs as any);
    expect(signMessageModule.signMessage).toHaveBeenCalledWith(
      mockClient,
      mockSignerClient,
      mockArgs,
      false,
    );
  });

  it('should call getSessionStatus with correct arguments', async () => {
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
    await actions.getSessionStatus(session);
    expect(getSessionStatusModule.getSessionStatus).toHaveBeenCalledWith(
      mockPublicClient,
      mockClient.account.address,
      session,
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
