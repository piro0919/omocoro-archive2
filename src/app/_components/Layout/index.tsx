"use client";
import fetcher from "@/lib/fetcher";
import { ProgressProvider } from "@bprogress/next/app";
import dynamic from "next/dynamic";
import { type ReactNode } from "react";
import { SWRConfig } from "swr";
import useShowWindowSize from "use-show-window-size";
import Footer from "../Footer";
import Header from "../Header";
import MobileMenu from "../MobileMenu";
import styles from "./style.module.css";

const PWAPrompt = dynamic(async () => import("react-ios-pwa-prompt"), {
  ssr: false,
});

export type LayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  useShowWindowSize({
    disable: process.env.NODE_ENV === "production",
  });

  return (
    <SWRConfig
      value={{
        fetcher,
        keepPreviousData: true,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
      }}
    >
      <ProgressProvider
        color="#fe0000"
        height="2px"
        options={{ showSpinner: true }}
        shallowRouting={true}
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <Header />
          </div>
          <main className={styles.main}>{children}</main>
          <div className={styles.footer}>
            <Footer />
          </div>
          <div className={styles.mobileMenu}>
            <MobileMenu />
          </div>
        </div>
        <PWAPrompt
          appIconPath="/icon-512x512.png"
          copyAddToHomeScreenStep="2) 「ホーム画面に追加」をタップします。"
          copyDescription="このウェブサイトにはアプリ機能があります。ホーム画面に追加してフルスクリーンおよびオフラインで使用できます。"
          copyShareStep="1) （四角から矢印が飛び出したマーク）をタップします。"
          copyTitle="ホーム画面に追加"
        />
      </ProgressProvider>
    </SWRConfig>
  );
}
