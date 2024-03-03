import {
  BlockhashWithExpiryBlockHeight,
  Commitment,
  Connection,
  Keypair,
  PublicKey,
  Transaction,
} from "@solana/web3.js";

export class TransactionBuilder {
  public transaction: Transaction;

  private connection: Connection;

  private latestBlockhash: BlockhashWithExpiryBlockHeight | undefined;

  static Commitment: Commitment = "confirmed";

  constructor(_connection: Connection) {
    this.connection = _connection;
    this.transaction = new Transaction();
  }

  static connection(_connection: Connection) {
    return new TransactionBuilder(_connection);
  }

  public add(...args: Parameters<Transaction["add"]>) {
    this.transaction.add(...args);
    return this;
  }

  public async build(inputs?: { feePayer?: PublicKey; signers?: Keypair[] }) {
    this.latestBlockhash = await this.connection.getLatestBlockhash(
      TransactionBuilder.Commitment,
    );
    this.transaction.recentBlockhash = this.latestBlockhash.blockhash;
    this.transaction.lastValidBlockHeight =
      this.latestBlockhash.lastValidBlockHeight;
    this.transaction.feePayer = inputs?.feePayer;
    inputs?.signers?.forEach((s) => this.transaction.sign(s));
    return this;
  }

  public async simulate() {
    const simulatedTransaction = await this.connection.simulateTransaction(
      this.transaction,
    );
    console.log("simulatedTransaction", simulatedTransaction);
    return this;
  }

  public async send() {
    if (!this.latestBlockhash) {
      throw new Error("Blockhash is not available");
    }
    const hash = await this.connection.sendRawTransaction(
      this.transaction.serialize(),
      {},
    );
    const result = await this.connection.confirmTransaction(
      {
        signature: hash,
        blockhash: this.latestBlockhash.blockhash,
        lastValidBlockHeight: this.latestBlockhash.lastValidBlockHeight,
      },
      TransactionBuilder.Commitment,
    );

    console.log("Confirm transaction", result);

    this.reset();
    return hash;
  }

  public reset() {
    this.transaction = new Transaction();
    this.latestBlockhash = undefined;
  }
}
