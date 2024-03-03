import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { decodeTransaction } from "@/blockchain/transaction";

type UseRedeemMutationInputs = {
  burnables: string[];
};

export function useRedeemMutation() {
  const { connection } = useConnection();
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const mutation = useMutation({
    mutationFn: async (inputs: UseRedeemMutationInputs) => {
      if (!publicKey || !signTransaction || !signAllTransactions)
        throw new Error("Wallet not connected");
      const txQuery = await fetch("/api/redeem/tx", {
        method: "POST",
        body: JSON.stringify({
          burnables: inputs.burnables,
          minter: publicKey.toBase58(),
        }),
      });
      const encodedTxs: Record<string, PromiseSettledResult<string>> = (
        await txQuery.json()
      ).txs;

      const txs = Object.entries(encodedTxs)
        .filter(([_, value]) => value.status === "fulfilled")
        .map(([key, result]) => {
          if (result.status !== "fulfilled") {
            throw new Error(`Unable to sign tx for ${key}`);
          }
          return decodeTransaction(result.value);
        });

      if (txs.length === 0)
        throw new Error(`No txs to sign. Please check network logs`);

      console.log("[query] decoded txs", txs);

      /**
       * Simulate the transaction to check if it will pass
       */
      console.log("[wallet] simulating transaction...");
      const simulatedResult = await Promise.allSettled(
        txs.map(async (tx) => {
          const result = await connection.simulateTransaction(tx as any);
          console.log("[wallet] simulated tx", result);
          return result;
        })
      );
      console.log("[wallet] simulated txs", simulatedResult);

      const signedTxs = await signAllTransactions(txs);

      const txHashes = await Promise.allSettled(
        signedTxs.map(async (tx) => {
          const signature = await connection.sendRawTransaction(
            tx.serialize(),
            {
              skipPreflight: true,
            }
          );
          enqueueSnackbar({
            variant: "info",
            message: `Waiting on ${signature} to be confirmed.`,
          });
          const result = await connection.confirmTransaction(
            signature,
            "confirmed"
          );
          if (result.value.err) throw new Error(result.value.err.toString());
          return signature;
        })
      );

      if (txHashes.length === 0) throw new Error("No tx hash broadcasted");
      if (txHashes.some((result) => result.status === "rejected")) {
        console.log("[wallet] broadcasted tx failed", txHashes);
        throw new Error("Some txs rejected. check console logs");
      }

      return txHashes;
    },
    onSuccess: (txHashes) => {
      enqueueSnackbar({
        variant: "success",
        message: `${txHashes.length} redeem tx(s) submitted successfully`,
      });
      console.log("[wallet] broadcasted txs", txHashes);
    },
    onError: (error) => {
      enqueueSnackbar({
        variant: "error",
        message: error.message,
      });
    },
  });
  return mutation;
}
