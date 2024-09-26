import { type EIP1193EventMap, type EIP1193Provider } from 'viem';
import { abstractTestnet } from 'viem/chains';
import { describe, expect, it, vi } from 'vitest';

import { transformEIP1193Provider } from '../../src/transformEIP1193Provider.js';

const listeners: Partial<{
  [K in keyof EIP1193EventMap]: Set<EIP1193EventMap[K]>;
}> = {};

const mockProvider: EIP1193Provider & { randomParam: string } = {
  request: vi.fn(),
  on: vi.fn((event, listener) => {
    if (!listeners[event]) {
      listeners[event] = new Set();
    }
    listeners[event].add(listener);
  }),
  removeListener: vi.fn((event, listener) => {
    if (listeners[event]) {
      listeners[event].delete(listener);
    }
  }),
  randomParam: 'randomParam',
};

describe('transformEIP1193Provider', () => {
  it('should transform the provider', () => {
    const transformedProvider = transformEIP1193Provider({
      provider: mockProvider,
      chain: abstractTestnet,
    });

    expect(transformedProvider.on).toEqual(mockProvider.on);
    expect(transformedProvider.removeListener).toEqual(
      mockProvider.removeListener,
    );
    // Make sure request function has been overridden
    expect(transformedProvider.request).not.toEqual(mockProvider.request);
    // Ensure other params are preserved
    expect((transformedProvider as any).randomParam).toEqual(
      mockProvider.randomParam,
    );
  });
});
