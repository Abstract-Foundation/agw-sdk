// Define ProviderRpcError locally to match implementation
class ProviderRpcError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = 'ProviderRpcError';
  }
}

import { describe, expect, it, vi } from 'vitest';

import { createPrivyProvider } from '../usePrivyCrossAppProvider.js';

describe('usePrivyCrossAppProvider', () => {
  describe('wallet_revokePermissions', () => {
    it('should handle permission revocation', async () => {
      const mockLogout = vi.fn().mockResolvedValue(null);
      const provider = createPrivyProvider({
        privyProvider: {
          logout: mockLogout,
        },
      });

      const result = await provider.request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });

      expect(result).toBeNull();
      expect(mockLogout).toHaveBeenCalled();
    });

    it('should handle logout failure', async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
      const provider = createPrivyProvider({
        privyProvider: {
          logout: mockLogout,
        },
      });

      await expect(
        provider.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        }),
      ).rejects.toThrow(
        new ProviderRpcError(4001, 'User rejected the request.'),
      );
    });
  });
});
