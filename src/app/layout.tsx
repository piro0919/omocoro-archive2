import { Noto_Sans_JP as NotoSansJP } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type JSX, type ReactNode } from "react";
import Layout from "./_components/Layout";
import "react-tabs/style/react-tabs.css";
import "ress";
import type { Metadata } from "next";
import "./globals.css";
import "@szhsin/react-menu/dist/index.css";
import "@szhsin/react-menu/dist/transitions/zoom.css";
import "pretty-checkbox/dist/pretty-checkbox.min.css";

const notoSansJP = NotoSansJP({ subsets: ["latin"] });
const APP_NAME = "オモコロアーカイブ";
const APP_DEFAULT_TITLE = "オモコロアーカイブ";
const APP_TITLE_TEMPLATE = "%s";
const APP_DESCRIPTION = "オモコロの非公式アーカイブサイトです";

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  applicationName: APP_NAME,
  description: APP_DESCRIPTION,
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    type: "website",
  },
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  twitter: {
    card: "summary",
    description: APP_DESCRIPTION,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): JSX.Element {
  return (
    <html lang="ja">
      <body className={notoSansJP.className}>
        <NuqsAdapter>
          <Layout>{children}</Layout>
        </NuqsAdapter>
      </body>
    </html>
  );
}
