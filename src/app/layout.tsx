import type { Metadata } from "next";
import "./globals.css";
import { headers } from "next/headers"; // added
import ContextProvider from "@/app/context";

export const metadata: Metadata = {
  title: "Test Project",
  description: "A place to create, mint, and shape your onchain identity.",
  keywords: "art, collectibles, nfts, crypto, blockchain",
  authors: [{ name: "Chirag Badhe", url: "https://github.com/chiragbadhe" }],
  creator: "Chirag Badhe",
  publisher: "Test Team",
  applicationName: "Test Project",
  themeColor: "#ffffff",
  openGraph: {
    title: "Test Project",
    description: "A place to create, mint, and shape your onchain identity.",
    url: "https://test-project.com",
    siteName: "Test Project",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookies = await headers().then((h) => h.get("cookie"));
  return (
    <html lang="en">
      <body>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  );
}
