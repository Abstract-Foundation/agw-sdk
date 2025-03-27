import { transformEIP1193Provider } from '@abstract-foundation/agw-client';
import type {
  Actions,
  AddEthereumChainParameter,
  Provider,
  ProviderConnectInfo,
  ProviderRpcError,
} from '@web3-react/types';
import { Connector } from '@web3-react/types';
import { type Chain, type EIP1193Provider } from 'viem';
import { abstract, abstractTestnet } from 'viem/chains';

const AGW_APP_ID = 'cm04asygd041fmry9zmcyn5o5';

const VALID_CHAINS: Record<number, Chain> = {
  [abstractTestnet.id]: abstractTestnet,
  [abstract.id]: abstract,
};

function parseChainId(chainId: string | number) {
  return typeof chainId === 'string' ? Number.parseInt(chainId, 16) : chainId;
}

export interface AbstractGlobalWalletConstructorArgs {
  actions: Actions;
  onError?: (error: Error) => void;
}

export class AbstractGlobalWallet extends Connector {
  private eagerConnection?: Promise<void>;

  constructor({ actions, onError }: AbstractGlobalWalletConstructorArgs) {
    super(actions, onError);
  }

  private async isomorphicInitialize(): Promise<void> {
    if (this.eagerConnection) return;

    return (this.eagerConnection = import('@privy-io/cross-app-connect').then(
      async ({ toPrivyWalletProvider }) => {
        const originalProvider = toPrivyWalletProvider({
          providerAppId: AGW_APP_ID,
          chains: [abstractTestnet],
        });

        const agwProvider = transformEIP1193Provider({
          provider: originalProvider as EIP1193Provider,
          chain: abstractTestnet,
        });

        if (agwProvider) {
          this.provider = agwProvider as Provider;

          this.provider.on(
            'connect',
            ({ chainId }: ProviderConnectInfo): void => {
              this.actions.update({ chainId: parseChainId(chainId) });
            },
          );

          this.provider.on('disconnect', (error: ProviderRpcError): void => {
            this.actions.resetState();
            this.onError?.(error);
          });
                     
          this.provider.on('chainChanged', (chainId: string): void => {
            this.actions.update({ chainId: parseChainId(chainId) });
          });

          this.provider.on('accountsChanged', (accounts: string[]): void => {
            this.actions.update({ accounts });
          });
        }
      },
    ));
  }
  /** {@inheritdoc Connector.connectEagerly} */
  public override async connectEagerly(): Promise<void> {
    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();

      if (!this.provider) return cancelActivation();

      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await this.provider.request({
        method: 'eth_accounts',
      })) as string[];
      if (!accounts.length) throw new Error('No accounts returned');
      const chainId = (await this.provider.request({
        method: 'eth_chainId',
      })) as string;
      this.actions.update({
        chainId: parseChainId(chainId),
        accounts,
      });
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  /** {@inheritdoc Connector.activate} */
  public async activate(
    desiredChainIdOrChainParameters?: number | AddEthereumChainParameter,
  ): Promise<void> {
    const desiredChainId =
      typeof desiredChainIdOrChainParameters === 'number'
        ? desiredChainIdOrChainParameters
        : desiredChainIdOrChainParameters?.chainId;

    const cancelActivation = this.actions.startActivation();

    try {
      await this.isomorphicInitialize();
      if (!this.provider) throw new Error('No AGW provider');

      await this.provider.request({ method: 'wallet_requestPermissions' });
      // Wallets may resolve eth_chainId and hang on eth_accounts pending user interaction, which may include changing
      // chains; they should be requested serially, with accounts first, so that the chainId can settle.
      const accounts = (await this.provider.request({
        method: 'eth_accounts',
      })) as string[];
      if (!accounts.length) throw new Error('No accounts returned');
      const chainId = (await this.provider.request({
        method: 'eth_chainId',
      })) as string;
      const receivedChainId = parseChainId(chainId);

      if (!desiredChainId || desiredChainId === receivedChainId)
        return this.actions.update({
          chainId: receivedChainId,
          accounts,
        });

      // if we're here, we can try to switch networks
      const desiredChain = VALID_CHAINS[desiredChainId];
      if (desiredChain) {
        const desiredChainIdHex = `0x${desiredChainId.toString(16)}`;
        await this.provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: desiredChainIdHex }],
        });
        await this.activate(desiredChainId);
      } else {
        throw new Error('Invalid chain');
      }
    } catch (error) {
      cancelActivation();
      throw error;
    }
  }

  /** {@inheritdoc Connector.deactivate} */
  public override async deactivate(): Promise<void> {
    if (!this.provider) return;
    await this.provider.request({
      method: 'wallet_revokePermissions',
      params: [{ eth_accounts: {} }],
    });
    this.actions.resetState();
  }
}
