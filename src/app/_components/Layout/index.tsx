import { JSX, ReactNode } from "react";
import styles from "./style.module.css";

export type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps): JSX.Element {
  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.h1}>オモコロアーカイブ</h1>
      </header>
      <main>{children}</main>
    </div>
  );
}
