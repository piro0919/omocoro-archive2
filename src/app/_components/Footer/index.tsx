import styles from "./style.module.css";

export default function Footer(): React.JSX.Element {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <span className={styles.copyright}>&copy; 2024 オモコロアーカイブ</span>
      </div>
    </footer>
  );
}
