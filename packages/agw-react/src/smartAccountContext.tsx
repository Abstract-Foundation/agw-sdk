'use client';
import {
  type AbstractClient,
  createAbstractClient,
} from '@abstract-foundation/agw-client';
import { toPrivyWalletProvider } from '@privy-io/cross-app-connect';
import {
  type SignTypedDataParams,
  useCrossAppAccounts,
  usePrivy,
  type User,
} from '@privy-io/react-auth';
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  type Account,
  type Address,
  custom,
  type CustomSource,
  type Hex,
  hexToString,
  toHex,
} from 'viem';
import { toAccount } from 'viem/accounts';
import { abstractTestnet, type ChainEIP712 } from 'viem/chains';

/** Interface returned by custom `useSmartAccount` hook */
interface SmartAccountInterface {
  /** Privy embedded wallet, used as a signer for the smart account */
  signer: Account | undefined;
  /** Smart account client to send signature/transaction requests to the smart account */
  smartAccountClient: AbstractClient | undefined;
  /** Smart account address */
  smartAccountAddress: Address | undefined;
  /** Boolean to indicate whether the smart account state has initialized */
  ready: boolean;
}

export const SmartAccountContext = createContext<SmartAccountInterface>({
  signer: undefined,
  smartAccountClient: undefined,
  smartAccountAddress: undefined,
  ready: false,
});

export const SmartAccountProvider = ({
  appId,
  children,
}: React.PropsWithChildren<{ appId: string }>) => {
  const { signMessage, signTypedData } = useCrossAppAccounts();
  const { user, ready, authenticated } = usePrivy();

  const account = useMemo(() => {
    const getAccountFromCrossAppUser = (user: User) => {
      const crossAppAccount = user.linkedAccounts.find(
        (account) => account.type === 'cross_app',
      );
      if (crossAppAccount?.embeddedWallets?.[0] === undefined) {
        throw new Error('No embedded wallet found');
      }
      const address = crossAppAccount.embeddedWallets[0].address;

      const signMessageWithPrivy: CustomSource['signMessage'] = async ({
        message,
      }) => {
        let messageString: string;
        if (typeof message !== 'string') {
          if (typeof message.raw === 'string') {
            messageString = hexToString(message.raw);
          } else {
            messageString = hexToString(toHex(message.raw));
          }
        } else {
          messageString = message;
        }
        return signMessage(messageString, {
          address,
        }) as Promise<`0x${string}`>;
      };

      const signTransactionWithPrivy: CustomSource['signTransaction'] =
        async () => {
          throw new Error('Raw transaction signing not currently implemented');
        };

      // Sanitize the message to ensure it's a valid JSON object
      // This is necessary because the message object can contain BigInt values, which
      // can't be serialized by JSON.stringify
      // TODO: Update this to not modify the underlying message but return a new copy
      // with the proper type for the privy side. They are technically the same data but
      // the viem typing doesn't play nice with the privy definition.
      function sanitizeMessage(message: any) {
        for (const key in message) {
          if (typeof message[key] === 'object' && message[key] !== null) {
            sanitizeMessage(message[key]);
          } else {
            if (typeof message[key] === 'bigint') {
              message[key] = message[key].toString();
            }
          }
        }
      }

      const signTypedDataWithPrivy: CustomSource['signTypedData'] = async (
        data,
      ) => {
        sanitizeMessage(data.message);
        return signTypedData(data as SignTypedDataParams, {
          address,
        }) as Promise<`0x${string}`>;
      };

      return toAccount({
        address: address as `0x${string}`,
        signMessage: signMessageWithPrivy,
        signTransaction: signTransactionWithPrivy,
        signTypedData: signTypedDataWithPrivy,
      });
    };

    if (!ready) return;
    if (!authenticated) return;
    return getAccountFromCrossAppUser(user as User);
  }, [ready, authenticated, user, signMessage, signTypedData]);

  // States to store the smart account and its status
  const [eoa, setEoa] = useState<Account | undefined>();
  const [smartAccountClient, setSmartAccountClient] = useState<
    AbstractClient | undefined
  >();
  const [smartAccountAddress, setSmartAccountAddress] = useState<
    Hex | undefined
  >();
  const [smartAccountReady, setSmartAccountReady] = useState(false);

  useEffect(() => {
    // Creates a smart account given a Privy `ConnectedWallet` object representing
    // the user's EOA.
    const createSmartWallet = async (eoa: Account) => {
      setEoa(eoa);

      const privyWalletProvider = toPrivyWalletProvider({
        providerAppId: appId,
        chains: [abstractTestnet],
      });

      const smartAccountClient = await createAbstractClient({
        signer: eoa,
        chain: abstractTestnet as ChainEIP712,
        transport: custom(privyWalletProvider),
      });

      setSmartAccountClient(smartAccountClient);
      setSmartAccountAddress(smartAccountClient.account.address);
      setSmartAccountReady(true);
    };

    if (account) createSmartWallet(account);
  }, [account]);

  return (
    <SmartAccountContext.Provider
      value={{
        ready: smartAccountReady,
        smartAccountClient: smartAccountClient,
        smartAccountAddress: smartAccountAddress,
        signer: eoa,
      }}
    >
      {children}
    </SmartAccountContext.Provider>
  );
};

export const useAbstractGlobalWallet = () => {
  return useContext(SmartAccountContext);
};
