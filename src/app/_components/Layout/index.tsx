"use client";
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
    </Suspense>
  );
}
