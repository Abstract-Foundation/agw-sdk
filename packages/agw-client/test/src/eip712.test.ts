import { describe, expect, it } from 'vitest';

import { assertEip712Request, isEIP712Transaction } from '../../src/eip712.js';
import { InvalidEip712TransactionError } from '../../src/errors/eip712.js';

describe('isEIP712Transaction', () => {
  it('should return true for transaction with type "eip712"', () => {
    const transaction = { type: 'eip712' };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });

  it('should return false for transaction with type "eip712"', () => {
    const transaction = { type: 'eip1559' };
    expect(isEIP712Transaction(transaction as any)).toBe(false);
  });

  it('should return true for transaction with customSignature', () => {
    const transaction = { customSignature: '0x123' };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });

  it('should return true for transaction with paymaster', () => {
    const transaction = { paymaster: '0x123' };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });

  it('should return true for transaction with paymasterInput', () => {
    const transaction = { paymasterInput: '0x123' };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });

  it('should return true for transaction with gasPerPubdata', () => {
    const transaction = { gasPerPubdata: 123n };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });

  it('should return false for transaction with invalid gasPerPubdata', () => {
    const transaction = { gasPerPubdata: 123 };
    expect(isEIP712Transaction(transaction as any)).toBe(false);
  });

  it('should return true for transaction with factoryDeps', () => {
    const transaction = { factoryDeps: [] };
    expect(isEIP712Transaction(transaction as any)).toBe(true);
  });
});

describe('assertEip712Request', () => {
  it('should throw if transaction is not EIP712', () => {
    const transaction = { type: 'eip1559' };
    expect(() => assertEip712Request(transaction as any)).toThrow(
      InvalidEip712TransactionError,
    );
  });
});
