import { BaseError } from 'viem';

export class InsufficientBalanceError extends BaseError {
  constructor() {
    super(['Insufficient balance for transaction.'].join('\n'), {
      name: 'InsufficientBalanceError',
    });
  }
}
