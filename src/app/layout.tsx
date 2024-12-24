import type { Metadata } from "next";
import "./globals.css";
import "ress";
import Layout from "./_components/Layout";

export const metadata: Metadata = {
  title: "オモコロアーカイブ",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
