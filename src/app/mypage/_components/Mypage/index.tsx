"use client";
import { setCookie } from "@/lib/cookies";
import { Checkbox } from "pretty-checkbox-react";
import { type JSX } from "react";
import usePwa from "use-pwa";
import { useBoolean } from "usehooks-ts";
import styles from "./style.module.css";

export type MypageProps = {
  isNotMovie: boolean;
  isNotOnigiri: boolean;
  isNotRadio: boolean;
};

export default function Mypage({
  isNotMovie,
  isNotOnigiri,
  isNotRadio,
}: MypageProps): JSX.Element {
  const {
    appinstalled,
    canInstallprompt,
    enabledPwa,
    isPwa,
    showInstallPrompt,
  } = usePwa();
  const { setValue: setCheckedIsNotMovie, value: checkedIsNotMovie } =
    useBoolean(isNotMovie);
  const { setValue: setCheckedIsNotOnigiri, value: checkedIsNotOnigiri } =
    useBoolean(isNotOnigiri);
  const { setValue: setCheckedIsNotRadio, value: checkedIsNotRadio } =
    useBoolean(isNotRadio);

  return (
    <div className={styles.wrapper}>
      <article className={styles.article}>
        <div className={styles.inner}>
          <h2 className={styles.h2}>設定</h2>
          <Checkbox
            onChange={(e) => {
              setCookie("is-not-onigiri", e.currentTarget.checked, {
                maxAge: 365 * 24 * 60 * 60,
                sameSite: "lax",
                secure: true,
              });

              setCheckedIsNotOnigiri(e.currentTarget.checked);
            }}
            checked={checkedIsNotOnigiri}
            className={styles.checkbox}
          >
            ほかほかおにぎりクラブ会員専用コンテンツを非表示にする
          </Checkbox>
          <Checkbox
            onChange={(e) => {
              setCookie("is-not-movie", e.currentTarget.checked, {
                maxAge: 365 * 24 * 60 * 60,
                sameSite: "lax",
                secure: true,
              });

              setCheckedIsNotMovie(e.currentTarget.checked);
            }}
            checked={checkedIsNotMovie}
            className={styles.checkbox}
          >
            動画を非表示にする
          </Checkbox>
          <Checkbox
            onChange={(e) => {
              setCookie("is-not-radio", e.currentTarget.checked, {
                maxAge: 365 * 24 * 60 * 60,
                sameSite: "lax",
                secure: true,
              });

              setCheckedIsNotRadio(e.currentTarget.checked);
            }}
            checked={checkedIsNotRadio}
            className={styles.checkbox}
          >
            ラジオを非表示にする
          </Checkbox>
        </div>
      </article>
      {enabledPwa && !isPwa ? (
        <article className={styles.article}>
          <div className={styles.inner}>
            <h2 className={styles.h2}>アプリ</h2>
            <button
              className={styles.button}
              disabled={!canInstallprompt || appinstalled}
              onClick={showInstallPrompt}
            >
              インストールする
            </button>
          </div>
        </article>
      ) : null}
    </div>
  );
}
