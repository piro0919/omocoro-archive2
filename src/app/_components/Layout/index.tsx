import { JSX, PropsWithChildren } from "react";
import styles from "./style.module.css";

export default function Layout({ children }: PropsWithChildren): JSX.Element {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.h1}>オモコロアーカイブ</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
