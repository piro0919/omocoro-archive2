"use client";
import { useGetCookie } from "cookies-next/client";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { setIsNotMovie, setIsNotOnigiri, setIsNotRadio } from "../../actions";
import styles from "./style.module.css";

const Toggle = dynamic(async () => import("react-toggle"), { ssr: false });

export default function Settings(): React.JSX.Element {
  const getCookie = useGetCookie();
  const isNotOnigiri = getCookie("is-not-onigiri");
  const isNotMovie = getCookie("is-not-movie");
  const isNotRadio = getCookie("is-not-radio");
  const { setTheme, theme } = useTheme();

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <label className={styles.label}>
          <span className={styles.labelText}>
            ほかほかおにぎりクラブ会員専用コンテンツを非表示にする
          </span>
          <Toggle
            onChange={(e) => {
              setIsNotOnigiri(e.currentTarget.checked);
            }}
            defaultChecked={isNotOnigiri === "true"}
            key={isNotOnigiri}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.labelText}>動画を非表示にする</span>
          <Toggle
            onChange={(e) => {
              setIsNotMovie(e.currentTarget.checked);
            }}
            defaultChecked={isNotMovie === "true"}
            key={isNotMovie}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.labelText}>ラジオを非表示にする</span>
          <Toggle
            onChange={(e) => {
              setIsNotRadio(e.currentTarget.checked);
            }}
            defaultChecked={isNotRadio === "true"}
            key={isNotRadio}
          />
        </label>
        <label className={styles.label}>
          <span className={styles.labelText}>ダークモードを有効にする</span>
          <Toggle
            onChange={(e) => {
              setTheme(e.currentTarget.checked ? "dark" : "light");
            }}
            defaultChecked={theme === "dark"}
          />
        </label>
      </div>
    </div>
  );
}
