"use client";

import { PropsWithChildren, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { network } from "@/blockchain/connections";

// import the styles
require("@solana/wallet-adapter-react-ui/styles.css");

export function AppWalletProvider(props: PropsWithChildren) {
  // you can use Mainnet, Devnet or Testnet here
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL as string, []);
  const wallets = useMemo(
    () => [],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>{props.children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
