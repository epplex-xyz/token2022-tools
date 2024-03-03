"use client";

import styles from "./page.module.css";
import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { RedeemForm } from "@/components/Form/RedeemForm";

export default function Home() {
  const { connected } = useWallet();

  const [isClient, setIsClient] = useState(false);

  const content = useMemo(() => {
    if (connected) {
      return <RedeemForm />;
    }
    return <WalletMultiButton/>;
  }, [connected]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <main className={styles.main}>
      {isClient && content}
    </main>
  );
}
