import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconArrowLeft,
  IconCategory,
  IconHome,
  IconPencil,
  IconSearch,
  IconSettings,
  IconX,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { type RefObject, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import * as z from "zod";
import styles from "./style.module.css";

const schema = z.object({
  keyword: z.string(),
});

type Schema = z.infer<typeof schema>;

export default function Header(): React.JSX.Element {
  const pathname = usePathname();
  const [keyword, setKeyword] = useQueryState(
    "keyword",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true }),
  );
  const { handleSubmit, register, setValue } = useForm<Schema>({
    defaultValues: {
      keyword,
    },
    resolver: zodResolver(schema),
  });
  const {
    setFalse: offIsShowSearch,
    setTrue: onIsShowSearch,
    value: isShowSearch,
  } = useBoolean(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue("keyword", keyword);
  }, [keyword, setValue]);

  useOnClickOutside(ref as RefObject<HTMLElement>, offIsShowSearch);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <motion.div
          animate={{
            scale: 1,
          }}
          initial={{
            scale: 0,
          }}
          transition={{
            delay: 0.25,
            duration: 0.25,
            ease: "backOut",
          }}
          className={styles.link}
        >
          <Link href="/">
            <div className={styles.logo}>
              <Image
                alt="オモコロアーカイブ"
                height={184}
                src="/logo.png"
                width={1220}
              />
            </div>
          </Link>
        </motion.div>
        <button
          className={styles.searchButton}
          onClick={() => onIsShowSearch()}
        >
          <IconSearch size={24} />
        </button>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit((data) => {
            setKeyword(data.keyword.replace(/\s+/g, " ").trim());
          })}
          className={styles.form}
        >
          <div className={styles.searchContainer}>
            <input
              {...register("keyword")}
              className={styles.searchInput}
              placeholder="記事を検索"
              type="text"
            />
            <button
              onClick={() => {
                setKeyword("");
              }}
              className={styles.clearButton}
              disabled={!keyword}
              type="button"
            >
              <IconX size={21} />
            </button>
            <button className={styles.submitButton} type="submit">
              <IconSearch size={24} />
            </button>
          </div>
        </form>
        <nav className={styles.nav}>
          <Link
            className={`${styles.navLink} ${pathname === "/" ? styles.navLinkActive : ""}`}
            href="/"
          >
            <IconHome size={18} />
            <span className={styles.navLinkText}>ホーム</span>
          </Link>
          <Link
            className={`${styles.navLink} ${pathname === "/writer" ? styles.navLinkActive : ""}`}
            href="/writer"
          >
            <IconPencil size={18} />
            <span className={styles.navLinkText}>ライター</span>
          </Link>
          <Link
            className={`${styles.navLink} ${pathname === "/category" ? styles.navLinkActive : ""}`}
            href="/category"
          >
            <IconCategory size={18} />
            <span className={styles.navLinkText}>カテゴリー</span>
          </Link>
          <Link
            className={`${styles.navLink} ${pathname === "/settings" ? styles.navLinkActive : ""}`}
            href="/settings"
          >
            <IconSettings size={18} />
            <span className={styles.navLinkText}>設定</span>
          </Link>
        </nav>
      </div>
      <div
        className={`${styles.mobileSearchContainer} ${isShowSearch ? styles.show : ""}`}
        ref={ref}
      >
        <div className={styles.mobileSearchInner}>
          <button
            className={styles.closeButton}
            onClick={() => offIsShowSearch()}
          >
            <IconArrowLeft size={24} />
          </button>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={handleSubmit((data) => {
              setKeyword(data.keyword.replace(/\s+/g, " ").trim());
            })}
            className={styles.form}
          >
            <div className={styles.searchContainer}>
              <input
                {...register("keyword")}
                className={styles.searchInput}
                placeholder="記事を検索"
                type="text"
              />
              <button
                onClick={() => {
                  setKeyword("");
                }}
                className={styles.clearButton}
                disabled={!keyword}
                type="button"
              >
                <IconX size={21} />
              </button>
              <button className={styles.submitButton} type="submit">
                <IconSearch size={24} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  );
}
