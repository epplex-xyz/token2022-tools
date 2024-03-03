import { PublicKey, Keypair } from "@solana/web3.js";
import { connection } from "@/blockchain/connections";
import { createBurnInstructions } from "./createBurnInstructions";
import {
  CreatePaymentInstructionsInputs,
  createPaymentInstructions,
} from "./createPaymentInstructions";
import { createT22NftTransferInstructions } from "./createT22NftTransferInstructions";
import {TransactionBuilder} from "@/blockchain/builder";

type CreateRedeemTransactionInputs = {
  nft: PublicKey;
  burn: PublicKey;
  minter: PublicKey;
  collection: PublicKey;
  price?: number | null;
  /** We pass minter and fee ourselves */
  payment?: Omit<CreatePaymentInstructionsInputs, "minter" | "fee">;
  mintPool: Keypair
};

export async function createRedeemTransaction(
  inputs: CreateRedeemTransactionInputs
): Promise<string> {

  console.log("create redeem tx", {
    collection: inputs.collection.toBase58(),
  });
  const burnIxs = await createBurnInstructions({
    burn: inputs.burn,
    owner: inputs.minter,
    collection: inputs.collection,
  });

  const transferIxs = await createT22NftTransferInstructions({
    connection,
    payer: inputs.minter,
    mint: inputs.nft,
    destination: inputs.minter,
    source: inputs.mintPool.publicKey,
  });

  const paymentIxs = createPaymentInstructions({
    minter: inputs.minter,
    fee: inputs.price,
    destination: inputs.payment?.destination,
    provider: inputs.payment?.provider,
    providerFee: inputs.payment?.providerFee,
  });

  const encodedTx = await TransactionBuilder.connection(connection)
    .add(...burnIxs)
    .add(...paymentIxs)
    .add(...transferIxs)
    .build({
      feePayer: inputs.minter,
      signers: [inputs.mintPool],
    })
    .then((tx) => tx.transaction.serialize({ verifySignatures: false }))
    .then((tx) => tx.toString("base64"));

  return encodedTx;
}
