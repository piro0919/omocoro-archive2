import {
  arrow,
  FloatingArrow,
  useClick,
  useFloating,
  useInteractions,
} from "@floating-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconCalendar,
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
import { type RefObject, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useOnClickOutside } from "usehooks-ts";
import z from "zod";
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
  const { handleSubmit, register } = useForm<Schema>({
    defaultValues: {
      keyword,
    },
    resolver: zodResolver(schema),
  });
  const [isOpen, setIsOpen] = useState(false);
  const arrowRef = useRef(null);
  const { context, floatingStyles, refs } = useFloating({
    middleware: [
      arrow({
        element: arrowRef,
      }),
    ],
    onOpenChange: setIsOpen,
    open: isOpen,
  });
  const click = useClick(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([click]);
  const ref = useRef<HTMLDivElement>(null);
  const handleClickOutside = (): void => {
    setIsOpen(false);
  };

  useOnClickOutside(ref as RefObject<HTMLElement>, handleClickOutside);

  return (
    <>
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
          {pathname === "/" ? (
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
                  <IconX size={18} />
                </button>
                <button className={styles.submitButton} type="submit">
                  <IconSearch size={18} />
                </button>
              </div>
            </form>
          ) : null}
          {pathname === "/" ? (
            <div className={styles.buttons}>
              <button className={styles.searchButton}>
                <IconSearch size={21} />
              </button>
              <div ref={ref}>
                <button ref={refs.setReference} {...getReferenceProps()}>
                  <IconCalendar size={21} />
                </button>
                {isOpen ? (
                  <div
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                    className={styles.floating}
                  >
                    <FloatingArrow
                      context={context}
                      fill="hsl(from var(--card) h s l)"
                      ref={arrowRef}
                      stroke="hsl(from var(--border) h s l)"
                      strokeWidth={1}
                    />
                    <input className={styles.input} type="date" />
                    <span className={styles.separator}>〜</span>
                    <input className={styles.input} type="date" />
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
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
      </header>
    </>
  );
}
