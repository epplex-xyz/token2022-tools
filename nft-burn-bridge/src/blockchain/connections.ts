import { config } from "dotenv";
config();

import { Cluster, Connection, clusterApiUrl } from "@solana/web3.js";

export const network: Cluster | 'local' = 'devnet';

function getClusterApiUrl() {  
  if (process.env.RPC_URL) {
    return process.env.RPC_URL;
  }
  switch (network) {
    case "local":
      const localUrl = process.env.NEXT_PUBLIC_LOCAL_CLUSTER_URL;
      if (!localUrl) {
        throw new Error("Missing local cluster url");
      }
      return localUrl;
    default:
      return clusterApiUrl(network);
  }
}

export const clusterUrl = getClusterApiUrl();

export const connection = new Connection(clusterUrl, "confirmed");
