import { toBytes, toHex, zeroAddress } from 'viem';
import {
  createClient,
  createWalletClient,
  EIP1193RequestFn,
  encodeAbiParameters,
  encodeFunctionData,
  http,
  keccak256,
  parseAbiParameters,
  serializeErc6492Signature,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { ChainEIP712 } from 'viem/zksync';
import { describe, expect, it, vi } from 'vitest';

import AccountFactoryAbi from '../../../src/abis/AccountFactory.js';
import { signMessage } from '../../../src/actions/signMessage.js';
import {
  SMART_ACCOUNT_FACTORY_ADDRESS,
  VALIDATOR_ADDRESS,
} from '../../../src/constants.js';
import { getInitializerCalldata } from '../../../src/utils.js';
import { anvilAbstractTestnet } from '../../anvil.js';
import { address } from '../../constants.js';

const RAW_SIGNATURE =
  '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

const baseClientRequestSpy = vi.fn(async ({ method, params }) => {
  if (method === 'privy_signSmartWalletMessage') {
    return RAW_SIGNATURE;
  }
  return anvilAbstractTestnet.getClient().request({ method, params } as any);
});

const baseClient = createClient({
  account: address.smartAccountAddress,
  chain: anvilAbstractTestnet.chain as ChainEIP712,
  transport: anvilAbstractTestnet.clientConfig.transport,
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

describe('signMessage', async () => {
  it('should transform personal_sign to typed signature for smart account', async () => {
    const expectedSignature = serializeErc6492Signature({
      address: SMART_ACCOUNT_FACTORY_ADDRESS,
      signature: encodeAbiParameters(parseAbiParameters(['bytes', 'address']), [
        RAW_SIGNATURE,
        VALIDATOR_ADDRESS,
      ]),
      data: encodeFunctionData({
        abi: AccountFactoryAbi,
        functionName: 'deployAccount',
        args: [
          keccak256(toBytes(address.signerAddress)),
          getInitializerCalldata(address.signerAddress, VALIDATOR_ADDRESS, {
            target: zeroAddress,
            allowFailure: false,
            callData: '0x',
            value: 0n,
          }),
        ],
      }),
    });

    const signedMessage = await signMessage(baseClient, signerClient, {
      message: 'Hello world',
    });

    expect(signedMessage).toBe(expectedSignature);
  });

  it('should pass through to privy if privyCrossApp is true', async () => {
    const signedMessage = await signMessage(
      baseClient,
      signerClient,
      {
        message: 'Hello world',
      },
      true,
    );

    expect(signedMessage).toBe(RAW_SIGNATURE);

    expect(baseClientRequestSpy).toHaveBeenLastCalledWith(
      {
        method: 'privy_signSmartWalletMessage',
        params: ['Hello world'],
      },
      { retryCount: 0 },
    );
  });

  it('should pass raw message to privy as string if privyCrossApp is true', async () => {
    const signedMessage = await signMessage(
      baseClient,
      signerClient,
      {
        message: {
          raw: new Uint8Array([
            72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100,
          ]),
        },
      },
      true,
    );

    expect(signedMessage).toBe(RAW_SIGNATURE);

    expect(baseClientRequestSpy).toHaveBeenLastCalledWith(
      {
        method: 'privy_signSmartWalletMessage',
        params: ['Hello world'],
      },
      { retryCount: 0 },
    );
  });

  it('should pass raw message to privy as hex string if privyCrossApp is true', async () => {
    const signedMessage = await signMessage(
      baseClient,
      signerClient,
      {
        message: { raw: toHex('Hello world') },
      },
      true,
    );

    expect(signedMessage).toBe(RAW_SIGNATURE);

    expect(baseClientRequestSpy).toHaveBeenLastCalledWith(
      {
        method: 'privy_signSmartWalletMessage',
        params: ['Hello world'],
      },
      { retryCount: 0 },
    );
  });
});
