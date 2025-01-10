import { decodeFunctionData, Hex } from 'viem';
import { describe, expect, it, vi } from 'vitest';

import AccountFactoryAbi from '../../src/abis/AccountFactory.js';
import { SMART_ACCOUNT_FACTORY_ADDRESS } from '../../src/constants.js';
import {
  convertBigIntToString,
  getInitializerCalldata,
  getSmartAccountAddressFromInitialSigner,
  isSmartAccountDeployed,
} from '../../src/utils.js';
import { address } from '../constants.js';

describe('convertBigIntToString', () => {
  it('should convert bigInt to string', () => {
    expect(convertBigIntToString(1n)).toBe('1');
  });

  it('should convert array of bigInts to array of strings', () => {
    const input = [BigInt(1), BigInt(2), BigInt(3)];
    const expected = ['1', '2', '3'];
    expect(convertBigIntToString(input)).toEqual(expected);
  });

  it('should convert object with bigInts to object with strings', () => {
    const input = { a: BigInt(1), b: BigInt(2), c: BigInt(3) };
    const expected = { a: '1', b: '2', c: '3' };
    expect(convertBigIntToString(input)).toEqual(expected);
  });

  it('should convert nested object with bigInts to nested object with strings', () => {
    const input = { a: { b: BigInt(1), c: BigInt(2) }, d: BigInt(3) };
    const expected = { a: { b: '1', c: '2' }, d: '3' };
    expect(convertBigIntToString(input)).toEqual(expected);
  });

  it('should convert array of objects with bigInts to array of objects with strings', () => {
    const input = [
      { a: BigInt(1), b: BigInt(2) },
      { a: BigInt(3), b: BigInt(4) },
    ];
    const expected = [
      { a: '1', b: '2' },
      { a: '3', b: '4' },
    ];
    expect(convertBigIntToString(input)).toEqual(expected);
  });

  it('should return other types unchanged', () => {
    const input = { a: '1', b: '2' };
    expect(convertBigIntToString(input)).toEqual(input);
  });
});

describe('getSmartAccountAddressFromInitialSigner', () => {
  it('should throw an error if initial signer is undefined', async () => {
    const publicClient = {
      readContract: vi.fn().mockResolvedValue(address.smartAccountAddress),
    };
    expect(
      getSmartAccountAddressFromInitialSigner(undefined!, publicClient as any),
    ).rejects.toThrowError(
      'Initial signer is required to get smart account address',
    );
  });

  it('should return the smart account address', () => {
    const initialSigner = address.signerAddress;
    const publicClient = {
      readContract: vi.fn().mockResolvedValue(address.smartAccountAddress),
    };
    const expected = address.smartAccountAddress;
    expect(
      getSmartAccountAddressFromInitialSigner(
        initialSigner,
        publicClient as any,
      ),
    ).resolves.toBe(expected);
    expect(publicClient.readContract).toHaveBeenCalledWith({
      address: SMART_ACCOUNT_FACTORY_ADDRESS,
      abi: AccountFactoryAbi,
      functionName: 'getAddressForSalt',
      args: [
        '0xd0c8707c906a797561008f61c112c70c07c0e57952e0348106ae2b8be92a5d59',
      ],
    });
  });
});

describe('isSmartAccountDeployed', () => {
  it('should return true if smart account is deployed', async () => {
    const publicClient = {
      getCode: vi.fn().mockResolvedValue('0x123'),
    };
    const smartAccountAddress = address.smartAccountAddress;
    expect(
      isSmartAccountDeployed(publicClient as any, smartAccountAddress),
    ).resolves.toBe(true);
    expect(publicClient.getCode).toHaveBeenCalledWith({
      address: smartAccountAddress,
    });
  });

  it('should return false if smart account is not deployed', async () => {
    const publicClient = {
      getCode: vi.fn().mockResolvedValue(null),
    };
    const smartAccountAddress = address.smartAccountAddress;
    expect(
      isSmartAccountDeployed(publicClient as any, smartAccountAddress),
    ).resolves.toBe(false);
    expect(publicClient.getCode).toHaveBeenCalledWith({
      address: smartAccountAddress,
    });
  });
});

describe('getInitializerCalldata', () => {
  it('should return the correct initializer calldata', () => {
    const initialOwnerAddress = address.signerAddress;
    const validatorAddress = address.validatorAddress;
    const initialCall = {
      target: address.smartAccountAddress,
      allowFailure: false,
      value: BigInt(0),
      callData: '0x1234' as Hex,
    };

    const result = getInitializerCalldata(
      initialOwnerAddress,
      validatorAddress,
      initialCall,
    );

    // Decode the result
    const decodedResult = decodeFunctionData({
      abi: [
        {
          name: 'initialize',
          type: 'function',
          inputs: [
            { name: 'initialK1Owner', type: 'address' },
            { name: 'initialK1Validator', type: 'address' },
            { name: 'modules', type: 'bytes[]' },
            {
              name: 'initCall',
              type: 'tuple',
              components: [
                { name: 'target', type: 'address' },
                { name: 'allowFailure', type: 'bool' },
                { name: 'value', type: 'uint256' },
                { name: 'callData', type: 'bytes' },
              ],
            },
          ],
          outputs: [],
          stateMutability: 'nonpayable',
        },
      ],
      data: result,
    });

    // Check if the decoded arguments match the input
    expect(decodedResult.args).toEqual([
      initialOwnerAddress,
      validatorAddress,
      [],
      {
        target: initialCall.target,
        allowFailure: initialCall.allowFailure,
        value: initialCall.value,
        callData: initialCall.callData,
      },
    ]);
  });
});
