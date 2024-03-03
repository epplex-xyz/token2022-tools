import {PublicKey, SystemProgram, TransactionInstruction} from "@solana/web3.js";

export type CreatePaymentInstructionsInputs = {
  minter: PublicKey;
  fee?: number | null;
  destination?: PublicKey;
  provider?: PublicKey;
  providerFee?: number | null;
};

export function createPaymentInstructions(
  inputs: CreatePaymentInstructionsInputs
) {
  const paymentIxs: TransactionInstruction[] = [];

  if (inputs.fee && inputs.destination) {
    console.log('Including fee for destination', {
      fee: inputs.fee,
      destination: inputs.destination.toBase58(),
    })
    paymentIxs.push(
      SystemProgram.transfer({
        fromPubkey: inputs.minter,
        toPubkey: inputs.destination,
        lamports: inputs.fee,
      })
    );
  }

  if (inputs.providerFee && inputs.provider) {
    console.log('Including fee for provider', {
      fee: inputs.providerFee,
      destination: inputs.provider.toBase58(),
    })
    paymentIxs.push(
      SystemProgram.transfer({
        fromPubkey: inputs.minter,
        toPubkey: inputs.provider,
        lamports: inputs.providerFee,
      })
    );
  }

  return paymentIxs;
}
