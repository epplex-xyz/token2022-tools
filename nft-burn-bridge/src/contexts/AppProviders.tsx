"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";
import { AppWalletProvider } from "./WalletProvider";

// Create a client
export const queryClient = new QueryClient();

export function AppProviders(props: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider autoHideDuration={3000}>
        <AppWalletProvider>{props.children}</AppWalletProvider>
      </SnackbarProvider>
    </QueryClientProvider>
  );
}
