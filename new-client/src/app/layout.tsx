// @ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/src/lib/utils";

import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";

const fontHeading = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Nft Gated Event ",
  description: "decentralized voting in africa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn("antialiased", fontHeading.variable, fontBody.variable)}
      >
        <Providers>
              {children}
        </Providers>
      </body>
    </html>
  );
}
