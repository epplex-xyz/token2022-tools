import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppProviders } from "@/contexts/AppProviders";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Assetdash",
  description: "Assetdash",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
