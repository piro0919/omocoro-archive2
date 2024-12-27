"use client";
import { setCookie } from "@/lib/cookies";
import { Checkbox } from "pretty-checkbox-react";
import { type JSX } from "react";
import usePwa from "use-pwa";
import { useBoolean } from "usehooks-ts";
import styles from "./style.module.css";

export type MypageProps = {
  isNotOnigiri: boolean;
};

export default function Mypage({ isNotOnigiri }: MypageProps): JSX.Element {
  const {
    appinstalled,
    canInstallprompt,
    enabledPwa,
    isPwa,
    showInstallPrompt,
  } = usePwa();
  const { setValue: setChecked, value: checked } = useBoolean(isNotOnigiri);

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <Checkbox
          onChange={(e) => {
            setCookie("is-not-onigiri", e.currentTarget.checked, {
              maxAge: 365 * 24 * 60 * 60,
              sameSite: "lax",
              secure: true,
            });

            setChecked(e.currentTarget.checked);
          }}
          checked={checked}
          className={styles.checkbox}
        >
          ほかほかおにぎりクラブ会員専用コンテンツを非表示にする
        </Checkbox>
        {enabledPwa && !isPwa ? (
          <button
            className={styles.button}
            disabled={!canInstallprompt || appinstalled}
            onClick={showInstallPrompt}
          >
            インストールする
          </button>
        ) : null}
      </div>
    </div>
  );
}
