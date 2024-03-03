import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  createTransferCheckedWithTransferHookInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

export async function tryCreateATAIx(
  connection: Connection,
  payer: PublicKey,
  ata: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tokenProgramId: PublicKey
): Promise<TransactionInstruction[]> {
  const acc = await connection.getAccountInfo(ata);
  if (acc === null) {
    return [
      createAssociatedTokenAccountInstruction(
        payer,
        ata,
        owner,
        mint,
        tokenProgramId
      ),
    ];
  } else {
    return [];
  }
}

export type CreateT22NftTransferTxInputs = {
  connection: Connection;
  mint: PublicKey;
  source: PublicKey;
  destination: PublicKey;
  payer: PublicKey;
  programId?: PublicKey;
  sourceAta?: PublicKey;
  destinationAta?: PublicKey;
};

export async function createT22NftTransferInstructions(
  inputs: CreateT22NftTransferTxInputs
): Promise<TransactionInstruction[]> {
  const { programId = TOKEN_2022_PROGRAM_ID } = inputs;
  // Doesn't need to create the ATA
  const sourceAta =
    inputs.sourceAta ??
    getAssociatedTokenAddressSync(
      inputs.mint, // mint
      inputs.source,
      false,
      programId
    );

  const destinationAta =
    inputs.destinationAta ??
    getAssociatedTokenAddressSync(
      inputs.mint, // mint
      inputs.destination,
      false,
      programId
    );

  // Try create destination ata ix
  const ix = await tryCreateATAIx(
    inputs.connection,
    inputs.payer, // payer
    destinationAta,
    inputs.destination, // owner
    inputs.mint, // mint
    programId
  );

  const t22Ix = await createTransferCheckedWithTransferHookInstruction(
    inputs.connection,
    sourceAta,
    inputs.mint,
    destinationAta,
    inputs.source,
    BigInt(1),
    0,
    [],
    "confirmed",
    programId
  );

  return [...ix, t22Ix];
}
