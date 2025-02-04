import { transformEIP1193Provider } from '@abstract-foundation/agw-client';
import {
  EthereumInjectedConnector,
  type IEthereum,
} from '@dynamic-labs/ethereum';
import { type EthereumWalletConnectorOpts } from '@dynamic-labs/ethereum-core';
import { DynamicError } from '@dynamic-labs/utils';
import { logger } from '@dynamic-labs/wallet-connector-core';
import { toPrivyWalletProvider } from '@privy-io/cross-app-connect';
import { type Chain as ViemChain, EIP1193Provider, toHex } from 'viem';
import { abstract, abstractTestnet } from 'viem/chains';
const AGW_APP_ID = 'cm04asygd041fmry9zmcyn5o5';

export class AbstractEvmWalletConnector extends EthereumInjectedConnector {
  /**
   * The name of the wallet connector
   * @override Required override from the base connector class
   */
  override name = 'Abstract';

  abstractNetworks: ViemChain[];

  static initHasRun = false;

  /**
   * The constructor for the connector, with the relevant metadata
   * @param props The options for the connector
   */
  constructor(props: EthereumWalletConnectorOpts) {
    super({
      ...props,
      metadata: {
        id: 'abstract',
        name: 'Abstract',
        icon: 'https://abstract-assets.abs.xyz/icons/light.png',
      },
    });

    this.abstractNetworks = [];
    for (const network of props.evmNetworks) {
      if (network.chainId === abstractTestnet.id) {
        this.abstractNetworks.push(abstractTestnet);
      }
      if (network.chainId === abstract.id) {
        this.abstractNetworks.push(abstract);
      }
    }
  }

  /**
   * Returns false because we only support Abstract
   */
  override supportsNetworkSwitching(): boolean {
    return false;
  }

  override isInstalledOnBrowser(): boolean {
    return true;
  }

  override async init(): Promise<void> {
    // this function can be called multiple times, so you must have a flag that indicates if the connector is already initialized
    // (can't be an instance variable, because it will be reset every time the connector is instantiated)
    // once the provider is initialized, you should emit the providerReady event once, and only once
    if (AbstractEvmWalletConnector.initHasRun) {
      return;
    }
    // if there are no abstract networks configured, we can't initialize the connector
    if (this.abstractNetworks.length === 0) {
      return;
    }
    AbstractEvmWalletConnector.initHasRun = true;

    logger.debug('[AbstractEvmWalletConnector] onProviderReady');
    this.walletConnectorEventsEmitter.emit('providerReady', {
      connector: this,
    });
  }

  override findProvider(): IEthereum | undefined {
    let chain: ViemChain | undefined = this.getActiveChain();
    if (!chain) {
      if (this.abstractNetworks.length === 1) {
        // use the only configured abstract network from the connector options
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        chain = this.abstractNetworks[0]!;
      } else {
        chain = abstractTestnet;
      }
    }

    const privyProvider = toPrivyWalletProvider({
      providerAppId: AGW_APP_ID,
      chains: [chain],
    });

    const provider = transformEIP1193Provider({
      provider: privyProvider as EIP1193Provider,
      isPrivyCrossApp: true,
      chain,
    });
    // Casting to IEthereum because the provider implements the eip-1193 interface
    // and that the expected type for the parent class EthereumInjectedConnector
    return provider as unknown as IEthereum;
  }

  override async getAddress(): Promise<string | undefined> {
    const accounts = await this.findProvider()?.request({
      method: 'eth_requestAccounts',
    });
    return accounts?.[0] as string | undefined;
  }

  override async getConnectedAccounts(): Promise<string[]> {
    return (
      (await this.findProvider()?.request({ method: 'eth_requestAccounts' })) ??
      []
    );
  }

  override async signMessage(message: string): Promise<string> {
    const provider = this.findProvider();
    if (!provider) {
      throw new DynamicError('No provider found');
    }
    const address = await this.getAddress();
    return (await provider.request({
      method: 'personal_sign',
      params: [toHex(message), address],
    })) as unknown as string;
  }
}
