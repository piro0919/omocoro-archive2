import { IconAdjustmentsHorizontal, IconSearch } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { type JSX } from "react";
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
  const { handleSubmit, register } = useForm({
    defaultValues: {
      keyword,
    },
  });

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.link} href="/">
          <h1 className={styles.h1}>オモコロアーカイブ</h1>
          <Image alt="オモコロアーカイブ" fill={true} src="/logo.png" />
        </Link>
        <Spacer grow={1} />
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(({ keyword }) => {
            setKeyword(keyword.replace(/\s+/g, " ").trim());
          })}
        >
          <div className={styles.search}>
            <IconSearch size={24} />
            <input
              {...register("keyword")}
              className={styles.input}
              placeholder="記事を検索"
            />
          </div>
        </form>
        <IconAdjustmentsHorizontal size={24} />
      </div>
    </header>
  );
}
