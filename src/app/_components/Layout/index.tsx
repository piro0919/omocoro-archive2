"use client";
import dynamic from "next/dynamic";
import {
  type JSX,
  type PropsWithChildren,
  Suspense,
  useEffect,
  useState,
} from "react";
import useShowWindowSize from "use-show-window-size";
import { useBoolean } from "usehooks-ts";
import Footer from "../Footer";
import Header from "../Header";
import MobileNavigation from "../MobileNavigation";
import styles from "./style.module.css";

const PWAPrompt = dynamic(async () => import("react-ios-pwa-prompt"), {
  ssr: false,
});

export default function Layout({ children }: PropsWithChildren): JSX.Element {
  const { setValue: setIsVisible, value: isVisible } = useBoolean(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = (): void => {
      const currentScrollY = window.scrollY;

      // 上にスクロールしたときは表示、下にスクロールしたときは非表示
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 50);
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return (): void => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, setIsVisible]);

  useShowWindowSize({
    disable: process.env.NODE_ENV === "production",
  });

  return (
    <Suspense fallback={null}>
      <div
        className={`${styles.header} ${!isVisible ? styles.headerHidden : ""}`}
      >
        <Header />
      </div>
      <main className={styles.main}>{children}</main>
      <div className={styles.footer}>
        <Footer />
      </div>
      <div className={styles.mobileNavigation}>
        <MobileNavigation />
      </div>
      <PWAPrompt
        appIconPath="/icon-512x512.png"
        copyAddToHomeScreenStep="2) 「ホーム画面に追加」をタップします。"
        copyDescription="このウェブサイトにはアプリ機能があります。ホーム画面に追加してフルスクリーンおよびオフラインで使用できます。"
        copyShareStep="1) （四角から矢印が飛び出したマーク）をタップします。"
        copyTitle="ホーム画面に追加"
        // isShown={true}
      />
    </Suspense>
  );
}
