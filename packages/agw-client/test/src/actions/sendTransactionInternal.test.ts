import {
  Address,
  createClient,
  createPublicClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  Hex,
  http,
  parseAbiParameters,
  toFunctionSelector,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { abstractTestnet, mainnet } from 'viem/chains';
import { ChainEIP712, ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { describe, expect, test, vi } from 'vitest';

import { sendTransactionInternal } from '../../../src/actions/sendTransactionInternal.js';
import {
  EOA_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../../../src/constants.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('viem', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...(original as any),
    encodeFunctionData: vi.fn().mockReturnValue('0xmockedEncodedData'),
  };
});

vi.mock('../../../src/actions/signTransaction', () => ({
  signTransaction: vi
    .fn()
    .mockResolvedValue(
      '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87',
    ),
}));

import { signTransaction } from '../../../src/actions/signTransaction.js';
import {
  getInitializerCalldata,
  isSmartAccountDeployed,
} from '../../../src/utils.js';

vi.mock('../../../src/utils.js');

const MOCK_TRANSACTION_HASH =
  '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const baseClientRequestSpy = vi.fn(async ({ method, params }) => {
  if (method === 'eth_chainId') {
    return anvilAbstractTestnet.chain.id;
  }
  if (method === 'eth_estimateGas') {
    return 158774n;
  }
  if (method === 'eth_getTransactionCount') {
    return '0x1';
  }
  if (method === 'eth_sendRawTransaction') {
    return MOCK_TRANSACTION_HASH;
  }
  if (method === 'eth_call') {
    const callParams = params as {
      to: Address;
      data: Hex;
    };
    if (
      callParams.to === address.smartAccountAddress &&
      callParams.data.startsWith(toFunctionSelector('function listHooks(bool)'))
    ) {
      return encodeAbiParameters(parseAbiParameters(['address[]']), [[]]);
    }
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
});

baseClient.request = baseClientRequestSpy as unknown as EIP1193RequestFn;

const signerClient = createWalletClient({
  account: toAccount(address.signerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

signerClient.request = (async ({ method, params }) => {
  if (method === 'eth_signTypedData_v4') {
    return RAW_SIGNATURE;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

publicClient.request = (async ({ method, params }) => {
  if (method === 'zks_estimateFee') {
    throw new Error('zks_estimateFee not supported');
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
}) as EIP1193RequestFn;

const transaction: ZksyncTransactionRequestEIP712 = {
  to: '0x5432100000000000000000000000000000000000',
  from: '0x0000000000000000000000000000000000000000',
  data: '0x1234',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

describe('sendTransactionInternal', () => {
  vi.mocked(getInitializerCalldata).mockReturnValue(
    '0xmockedInitializerCallData',
  );
  const testCases = [
    {
      name: 'is initial transaction',
      isDeployed: false,
      expectedToAddress: SMART_ACCOUNT_FACTORY_ADDRESS,
      expectedFromAddress: address.signerAddress,
    },
    {
      name: 'is not initial transaction',
      isDeployed: true,
      expectedToAddress: transaction.to,
      expectedFromAddress: address.smartAccountAddress,
    },
  ];

  test.each(testCases)(
    '$name',
    async ({ isDeployed, expectedToAddress, expectedFromAddress }) => {
      vi.mocked(isSmartAccountDeployed).mockResolvedValue(isDeployed);
      const transactionHash = await sendTransactionInternal(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: anvilAbstractTestnet.chain as ChainEIP712,
        } as any,
        EOA_VALIDATOR_ADDRESS,
      );

      expect(transactionHash).toBe(MOCK_TRANSACTION_HASH);

      expect(signTransaction).toHaveBeenCalledWith(
        baseClient,
        signerClient,
        publicClient,
        expect.objectContaining({
          type: 'eip712',
          to: expectedToAddress,
          from: expectedFromAddress,
          data: isDeployed ? '0x1234' : '0xmockedEncodedData',
          paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
          paymasterInput: '0x',
          chainId: abstractTestnet.id,
        }),
        EOA_VALIDATOR_ADDRESS,
        {},
        undefined,
      );

      // Validate that the sendRawTransaction call was made with the correct parameters
      const sendRawTransactionCall = baseClientRequestSpy.mock.calls.find(
        (call) => call[0].method === 'eth_sendRawTransaction',
      );
      expect(sendRawTransactionCall).toBeDefined();
      if (sendRawTransactionCall) {
        const [rawTransaction] = sendRawTransactionCall[0].params;
        expect(rawTransaction).toEqual(
          '0x9afe47f3d95eccfc9210851ba5f877f76d372514a26b48bad848a07f77c33b87',
        );
      }
    },
  );
});

test('sendTransactionInternal with mismatched chain', async () => {
  const invalidChain = mainnet;
  expect(
    async () =>
      await sendTransactionInternal(
        baseClient,
        signerClient,
        publicClient,
        {
          ...transaction,
          type: 'eip712',
          account: baseClient.account,
          chain: invalidChain,
        } as any,
        EOA_VALIDATOR_ADDRESS,
      ),
  ).rejects.toThrowError('Current Chain ID:  11124');
});
