import {
  createClient,
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  http,
  parseEther,
  toFunctionSelector,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { beforeEach, expect, test, vi } from 'vitest';

import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

vi.mock('../../../src/utils.js');
vi.mock('../../../src/actions/sendTransactionForSessionSync', () => ({
  sendTransactionForSessionSync: vi.fn().mockResolvedValue({
    blockHash: '0x1234',
    blockNumber: 1n,
    transactionHash: '0xmockedTransactionHash',
    status: 'success',
  }),
}));

import { sendTransactionForSessionSync } from '../../../src/actions/sendTransactionForSessionSync.js';
import { writeContractForSessionSync } from '../../../src/actions/writeContractForSessionSync.js';
import { LimitType, LimitZero, SessionConfig } from '../../../src/sessions.js';
import { isSmartAccountDeployed } from '../../../src/utils.js';

const mockReceipt = {
  blockHash: '0x1234',
  blockNumber: 1n,
  transactionHash: '0xmockedTransactionHash',
  status: 'success',
};

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const signerClient = createWalletClient({
  account: toAccount(address.sessionSignerAddress),
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: http(baseClient.transport.url),
});

const publicClient = createPublicClient({
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
});

const TestTokenABI = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'qty',
        type: 'uint256',
      },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const MOCK_CONTRACT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

const session: SessionConfig = {
  signer: signerClient.account.address,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limit: parseEther('1'),
    limitType: LimitType.Lifetime,
    period: 0n,
  },
  callPolicies: [
    {
      selector: toFunctionSelector('function mint(address,uint256)'),
      target: MOCK_CONTRACT_ADDRESS,
      constraints: [],
      maxValuePerUse: 0n,
      valueLimit: LimitZero,
    },
  ],
  transferPolicies: [],
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('writeContractForSessionSync', async () => {
  vi.mocked(isSmartAccountDeployed).mockResolvedValue(true);
  vi.mocked(sendTransactionForSessionSync).mockResolvedValue(
    mockReceipt as any,
  );

  const expectedData = encodeFunctionData({
    abi: TestTokenABI,
    args: [address.signerAddress, 1n],
    functionName: 'mint',
  });

  const receipt = await writeContractForSessionSync(
    baseClient,
    signerClient,
    publicClient,
    {
      abi: TestTokenABI,
      account: baseClient.account,
      address: MOCK_CONTRACT_ADDRESS,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      functionName: 'mint',
      args: [address.signerAddress, 1n],
    },
    session,
  );

  expect(receipt).toBe(mockReceipt);

  expect(sendTransactionForSessionSync).toHaveBeenCalledWith(
    baseClient,
    signerClient,
    publicClient,
    {
      account: baseClient.account,
      chain: anvilAbstractTestnet.chain as ChainEIP712,
      data: expectedData,
      to: MOCK_CONTRACT_ADDRESS,
      throwOnReceiptRevert: undefined,
      timeout: undefined,
    },
    session,
    undefined,
  );
});
