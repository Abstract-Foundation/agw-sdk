'use client'
import PrivyAuth from "@privy-io/react-auth";
const {
  PrivyProvider
} = PrivyAuth;
import React from "react";
import {
  type Chain,
} from "viem";

import { SmartAccountProvider } from "./smartAccountContext.js";

interface AbstractWalletProviderProps {
  appId: string;
  defaultChain: Chain;
  supportedChains: Chain[];
}

export const AbstractWalletProvider = ({
  appId,
  defaultChain,
  supportedChains,
  children,
}: React.PropsWithChildren<AbstractWalletProviderProps>) => {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        embeddedWallets: {
          createOnLogin: "off",
          noPromptOnSignature: true,
        },
        defaultChain: defaultChain,
        supportedChains: supportedChains,
      }}
    >
      <SmartAccountProvider appId={appId}>{children}</SmartAccountProvider>
    </PrivyProvider>
  );
};
