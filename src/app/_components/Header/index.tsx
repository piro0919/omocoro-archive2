import { Menu, MenuItem } from "@szhsin/react-menu";
import {
  IconArrowLeft,
  IconCalendarDown,
  IconCalendarUp,
  IconCalendarWeek,
  IconCategory,
  IconGridDots,
  IconPencil,
  IconSearch,
  IconUserCircle,
} from "@tabler/icons-react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { type JSX, useEffect, useRef } from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useForm } from "react-hook-form";
import Spacer from "react-spacer";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import DateRangePickerModal from "../DateRangePickerModal";
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
  const {
    setFalse: offIsShowSearch,
    setTrue: onIsShowSearch,
    value: isShowSearch,
  } = useBoolean(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const {
    setFalse: offIsShowDateRangePicker,
    setTrue: onIsShowDateRangePicker,
    value: isShowDateRangePicker,
  } = useBoolean(false);
  const { theme } = useTheme();

  // @ts-expect-error: useOnClickOutside does not support ref type
  useOnClickOutside(ref, offIsShowSearch);

  useEffect(() => {
    setValue("keyword", keyword);
  }, [keyword, setValue]);

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
            <Link className={styles.link2} href="/">
              <h1 className={styles.h1}>オモコロアーカイブ</h1>
              <Image alt="オモコロアーカイブ" fill={true} src="/logo.png" />
            </Link>
          </motion.div>
          <Spacer grow={1} />
          {pathname === "/" && !isShowSearch ? (
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
          ) : null}
          {pathname === "/" ? (
            <button
              className={styles.searchButton}
              onClick={() => onIsShowSearch()}
            >
              <IconSearch size={24} />
            </button>
          ) : null}
          {pathname === "/" ? (
            <button onClick={() => onIsShowDateRangePicker()}>
              <IconCalendarWeek size={24} />
            </button>
          ) : null}
          {pathname === "/" ? (
            order === "desc" ? (
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
            )
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
            theming={theme}
            transition={true}
          >
            <MenuItem onClick={() => router.push("/writer")}>
              <IconPencil size={24} />
              <span className={styles.menuText}>ライター</span>
            </MenuItem>
            <MenuItem onClick={() => router.push("/category")}>
              <IconCategory size={24} />
              <span className={styles.menuText}>カテゴリー</span>
            </MenuItem>
            <MenuItem onClick={() => router.push("/mypage")}>
              <IconUserCircle size={24} />
              <span className={styles.menuText}>マイページ</span>
            </MenuItem>
          </Menu>
        </div>
        <div
          className={`${styles.inner2} ${isShowSearch ? styles.show : ""}`}
          ref={ref}
        >
          <button onClick={() => offIsShowSearch()}>
            <IconArrowLeft size={24} />
          </button>
          {isShowSearch ? (
            <form
              // eslint-disable-next-line @typescript-eslint/no-misused-promises
              onSubmit={handleSubmit(({ keyword }) => {
                setKeyword(keyword.replace(/\s+/g, " ").trim());
              })}
              className={styles.form2}
            >
              <IconSearch size={24} />
              <input
                {...register("keyword")}
                className={styles.input2}
                placeholder="記事を検索"
              />
            </form>
          ) : null}
        </div>
      </header>
      <DateRangePickerModal
        isOpen={isShowDateRangePicker}
        onClose={offIsShowDateRangePicker}
      />
    </>
  );
}
