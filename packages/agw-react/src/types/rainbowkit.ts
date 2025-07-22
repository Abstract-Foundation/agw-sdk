import type { Connector, CreateConnectorFn } from 'wagmi';

export type InstructionStepName =
  | 'install'
  | 'create'
  | 'scan'
  | 'connect'
  | 'refresh';

interface RainbowKitConnector {
  mobile?: {
    getUri?: (uri: string) => string;
  };
  desktop?: {
    getUri?: (uri: string) => string;
    instructions?: {
      learnMoreUrl: string;
      steps: {
        step: InstructionStepName;
        title: string;
        description: string;
      }[];
    };
  };
  qrCode?: {
    getUri: (uri: string) => string;
    instructions?: {
      learnMoreUrl: string;
      steps: {
        step: InstructionStepName;
        title: string;
        description: string;
      }[];
    };
  };
  extension?: {
    instructions?: {
      learnMoreUrl: string;
      steps: {
        step: InstructionStepName;
        title: string;
        description: string;
      }[];
    };
  };
}
export type Wallet = {
  id: string;
  name: string;
  rdns?: string;
  shortName?: string;
  iconUrl: string | (() => Promise<string>);
  iconAccent?: string;
  iconBackground: string;
  installed?: boolean;
  downloadUrls?: {
    android?: string;
    ios?: string;
    mobile?: string;
    qrCode?: string;
    chrome?: string;
    edge?: string;
    firefox?: string;
    opera?: string;
    safari?: string;
    browserExtension?: string;
    macos?: string;
    windows?: string;
    linux?: string;
    desktop?: string;
  };
  hidden?: () => boolean;
  createConnector: (walletDetails: WalletDetailsParams) => CreateConnectorFn;
} & RainbowKitConnector;

export type RainbowKitDetails = Omit<Wallet, 'createConnector' | 'hidden'> & {
  index: number;
  groupIndex: number;
  groupName: string;
  isWalletConnectModalConnector?: boolean;
  isRainbowKitConnector: boolean;
  walletConnectModalConnector?: Connector;
  showQrModal?: true;
};

export interface WalletDetailsParams {
  rkDetails: RainbowKitDetails;
}
