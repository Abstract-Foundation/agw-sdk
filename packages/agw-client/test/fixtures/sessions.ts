import { parseEther } from 'viem';
import { LimitType, SessionConfig } from '../../src/sessions';

export const sessionSignerAddress: `0x${string}` =
  '0x51Cf8A1F76d1b4266CE2Dae450C4A6C95de3a731';

export const emptySession: SessionConfig = {
  signer: sessionSignerAddress,
  expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7),
  feeLimit: {
    limit: parseEther('1'),
    limitType: LimitType.Lifetime,
    period: 0n,
  },
  callPolicies: [],
  transferPolicies: [],
};
