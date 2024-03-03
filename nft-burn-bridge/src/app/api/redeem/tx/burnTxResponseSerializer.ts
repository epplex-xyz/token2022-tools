
type BurnTxResponseSerializerInputs = {
  burnables: string[];
  settled: PromiseSettledResult<string>[];
};

export async function burnTxResponseSerializer(
  inputs: BurnTxResponseSerializerInputs
) {
  const txs = inputs.burnables.reduce((acc, address, i) => {
    const tx = inputs.settled[i];
    switch (tx?.status) {
      case "fulfilled":
        return {
          ...acc,
          [address]: tx,
        };
      case "rejected":
        return {
          ...acc,
          [address]: {
            status: tx.status,
            reason: tx.reason.message,
          },
        };
      default:
        throw new Error("unexpected promise state");
    }
  }, {});
  return txs;
}
