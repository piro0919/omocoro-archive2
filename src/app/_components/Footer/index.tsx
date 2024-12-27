import { type JSX } from "react";
import styles from "./style.module.css";

export default function Footer(): JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p>&copy; 2024 kk-web</p>
      </div>
    </footer>
  );
}
