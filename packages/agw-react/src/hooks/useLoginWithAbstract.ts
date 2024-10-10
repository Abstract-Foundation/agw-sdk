import { useCallback } from 'react';
import { useConnect, useDisconnect } from 'wagmi';

interface AbstractLogin {
  login: () => void;
  logout: () => void;
}

export const useLoginWithAbstract = (): AbstractLogin => {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const login = useCallback(() => {
    const connector = connectors.find((c) => c.id === 'xyz.abs.privy');
    if (!connector) {
      throw new Error('Abstract connector not found');
    }
    connect({ connector });
  }, [connect, connectors]);

  const logout = useCallback(() => {
    disconnect();
  }, [disconnect]);

  return {
    login,
    logout,
  };
};
