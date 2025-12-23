import {
  IconCategory,
  IconHome,
  IconPencil,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./style.module.css";

export default function MobileMenu(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link
        className={`${styles.link} ${pathname === "/" ? styles.linkActive : ""}`}
        href="/"
      >
        <IconHome size={24} />
        <span>ホーム</span>
      </Link>
      <Link
        className={`${styles.link} ${pathname === "/writer" ? styles.linkActive : ""}`}
        href="/writer"
      >
        <IconPencil size={24} />
        <span>ライター</span>
      </Link>
      <Link
        className={`${styles.link} ${pathname === "/category" ? styles.linkActive : ""}`}
        href="/category"
      >
        <IconCategory size={24} />
        <span>カテゴリー</span>
      </Link>
      <Link
        className={`${styles.link} ${pathname === "/settings" ? styles.linkActive : ""}`}
        href="/settings"
      >
        <IconSettings size={24} />
        <span>設定</span>
      </Link>
    </nav>
  );
}
