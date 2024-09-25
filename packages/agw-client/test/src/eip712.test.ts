import { describe, expect, it } from 'vitest';

import { assertEip712Request, isEIP712Transaction } from '../../src/eip712.js';
import { InvalidEip712TransactionError } from '../../src/errors/eip712.js';

describe('isEIP712Transaction', () => {
  const testCases = [
    { desc: 'type "eip712"', input: { type: 'eip712' }, expected: true },
    { desc: 'type not "eip712"', input: { type: 'eip1559' }, expected: false },
    {
      desc: 'customSignature',
      input: { customSignature: '0x123' },
      expected: true,
    },
    { desc: 'paymaster', input: { paymaster: '0x123' }, expected: true },
    {
      desc: 'paymasterInput',
      input: { paymasterInput: '0x123' },
      expected: true,
    },
    {
      desc: 'valid gasPerPubdata',
      input: { gasPerPubdata: 123n },
      expected: true,
    },
    {
      desc: 'invalid gasPerPubdata',
      input: { gasPerPubdata: 123 },
      expected: false,
    },
    { desc: 'factoryDeps', input: { factoryDeps: [] }, expected: true },
  ];

  testCases.forEach(({ desc, input, expected }) => {
    it(`should return ${expected} for transaction with ${desc}`, () => {
      expect(isEIP712Transaction(input as any)).toBe(expected);
    });
  });
});

describe('assertEip712Request', () => {
  it('should throw if transaction is not EIP712', () => {
    expect(() => assertEip712Request({ type: 'eip1559' } as any)).toThrow(
      InvalidEip712TransactionError,
    );
  });
});
