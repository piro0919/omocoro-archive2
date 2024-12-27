import { Menu, MenuItem } from "@szhsin/react-menu";
import {
  IconCalendarDown,
  IconCalendarUp,
  IconCategory,
  IconGridDots,
  IconPencil,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { type JSX, useEffect } from "react";
import { useForm } from "react-hook-form";
import Spacer from "react-spacer";
import styles from "./style.module.css";

export default function Header(): JSX.Element {
  const [keyword, setKeyword] = useQueryState(
    "keyword",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const { handleSubmit, register, setValue } = useForm({
    defaultValues: {
      keyword,
    },
  });
  const pathname = usePathname();
  const [order, setOrder] = useQueryState(
    "order",
    parseAsStringLiteral(["asc", "desc"])
      .withDefault("desc")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );

  useEffect(() => {
    setValue("keyword", keyword);
  }, [keyword, setValue]);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.link} href="/">
          <h1 className={styles.h1}>オモコロアーカイブ</h1>
          <Image alt="オモコロアーカイブ" fill={true} src="/logo.png" />
        </Link>
        <Spacer grow={1} />
        {pathname === "/" ? (
          <>
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(({ keyword }) => {
                setKeyword(keyword.replace(/\s+/g, " ").trim());
              })}
              className={styles.form}
            >
              <IconSearch size={24} />
              <input
                {...register("keyword")}
                className={styles.input}
                placeholder="記事を検索"
              />
            </form>
            <button className={styles.searchButton}>
              <IconSearch size={24} />
            </button>
            {order === "desc" ? (
              <button
                onClick={() => {
                  setOrder("asc");
                }}
              >
                <IconCalendarUp size={24} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setOrder("desc");
                }}
              >
                <IconCalendarDown size={24} />
              </button>
            )}
          </>
        ) : null}
        <Menu
          menuButton={
            <button className={styles.menuButton}>
              <IconGridDots size={24} />
            </button>
          }
          align="end"
          arrow={true}
          direction="bottom"
          transition={true}
        >
          <MenuItem href="/writer">
            <IconPencil size={24} />
            <span className={styles.menuText}>ライター</span>
          </MenuItem>
          <MenuItem href="/category">
            <IconCategory size={24} />
            <span className={styles.menuText}>カテゴリー</span>
          </MenuItem>
          <MenuItem href="/mypage">
            <IconUserCircle size={24} />
            <span className={styles.menuText}>マイページ</span>
          </MenuItem>
        </Menu>
      </div>
    </header>
  );
}
