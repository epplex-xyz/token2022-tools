import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { PublicKey, Keypair} from "@solana/web3.js";
import { createRedeemTransaction } from "./onchain/createRedeemTransaction";
import { burnTxResponseSerializer } from "./burnTxResponseSerializer";

const RedeemRequestSchema = z.object({
  burnables: z.string().array(),
  minter: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { minter, burnables } = RedeemRequestSchema.parse(requestBody);
    /**
     * Map each burn nft address into a encoded transaction
     */
    const burnTxPromises = burnables.map(async (address) => {
      /**
       * Building the transaction with mint fee π:58and provider fee
       * user will be able to redeem burnable.redeem_id upon
       * transaction success
       */
      const addy = new PublicKey(address);
      const mintPool = Keypair.generate(); // TODO: replace
      const tx = await createRedeemTransaction({
        minter: new PublicKey(minter),
        burn: addy, // TODO replace: pNFT to be burnt
        nft: addy, // TODO replace: T22 NFT to be transferred
        // collectionMint address of pNFT collection
        collection: addy, // TODO replace
        // NFT project charge fee
        price: 6.9, // TODO: replace
        payment: {
          destination: mintPool.publicKey,
          // Infra service fee destination
          provider: addy, // TODO: replace
          // Infra service fee
          providerFee: 4.20, // TODO: replace
        },
        mintPool: mintPool
      });
      return tx;
    });

    /**
     * Serialize the burn txs and return the response
     * If any of the tx building fails, the serialized
     * response will contain its error
     */
    const txs = await burnTxResponseSerializer({
      burnables,
      settled: await Promise.allSettled(burnTxPromises),
    });

    return NextResponse.json({
      txs,
    });
  } catch (e) {
    console.log("post error", e);
    return NextResponse.json(
      {
        error: (e as Error).message,
      },
      { status: 400 }
    );
  }
}
