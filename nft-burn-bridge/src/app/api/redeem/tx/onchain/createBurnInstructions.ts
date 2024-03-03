import { PublicKey } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { signerIdentity } from "@metaplex-foundation/umi";
import {
  TokenStandard,
  burnV1,
  mplTokenMetadata,
  findMetadataPda,
} from "@metaplex-foundation/mpl-token-metadata";

import {
  fromWeb3JsPublicKey,
  toWeb3JsInstruction,
} from "@metaplex-foundation/umi-web3js-adapters";
import { connection } from "@/blockchain/connections";

type CreateBurnInstructionsInputs = {
  burn: PublicKey;
  collection: PublicKey;
  owner: PublicKey;
};

/**
 * Create burn instructions for Metaplex NFTs through their UMI interface
 */
export async function createBurnInstructions(
  inputs: CreateBurnInstructionsInputs
) {
  const umi = createUmi(connection.rpcEndpoint)
    .use(
      signerIdentity({
        publicKey: fromWeb3JsPublicKey(inputs.owner),
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
        signMessage: async (message) => message,
      })
    )
    .use(mplTokenMetadata());

  const metadata = findMetadataPda(umi, {
    mint: fromWeb3JsPublicKey(inputs.collection),
  });
  return await burnV1(umi, {
    mint: fromWeb3JsPublicKey(inputs.burn),
    tokenOwner: fromWeb3JsPublicKey(inputs.owner),
    tokenStandard: TokenStandard.ProgrammableNonFungible,
    collectionMetadata: metadata,
  })
    .getInstructions()
    .map(toWeb3JsInstruction);
}
