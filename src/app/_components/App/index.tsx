"use client";
import { type Article, type Category, type Writer } from "@prisma/client";
import usePrevious from "@react-hook/previous";
import { IconCircleXFilled } from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import { parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";
import { Fragment, type JSX, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { TailSpin } from "react-loader-spinner";
import useSWR from "swr";
import { type StrictTupleKey } from "swr/_internal";
import useSWRInfinite from "swr/infinite";
import { useBoolean } from "usehooks-ts";
import { fetchArticles, fetchArticlesCount } from "./actions";
import styles from "./style.module.css";

export type AppProps = {
  initialArticles: (Article & { category: Category; writers: Writer[] })[];
  initialArticlesCount: number;
};

export default function App({
  initialArticles,
  initialArticlesCount,
}: AppProps): JSX.Element {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [from, setFrom] = useQueryState(
    "from",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [keyword, setKeyword] = useQueryState(
    "keyword",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [order] = useQueryState(
    "order",
    parseAsStringLiteral(["asc", "desc"]).withDefault("desc"),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const [writer, setWriter] = useQueryState(
    "writer",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const searchParamsObject = useMemo(
    () => ({
      category,
      from,
      keyword,
      order,
      to,
      writer,
    }),
    [category, from, keyword, order, to, writer],
  );
  const { data: articlesCount = initialArticlesCount } = useSWR(
    ["articlesCount", searchParamsObject],
    async () => fetchArticlesCount({ category, from, keyword, to, writer }),
    {
      dedupingInterval: 2000,
      fallbackData: initialArticlesCount,
      revalidateOnFocus: false,
    },
  );
  const getKey = (
    pageIndex: number,
    previousPageData: (Article & { category: Category; writers: Writer[] })[],
  ): StrictTupleKey => {
    if (previousPageData && !previousPageData.length) return null;

    return ["articles", searchParamsObject, pageIndex];
  };
  const { data, isValidating, setSize, size } = useSWRInfinite(
    getKey,
    async ([, , pageIndex]) =>
      fetchArticles({
        category,
        from,
        keyword,
        order,
        page: pageIndex as number,
        to,
        writer,
      }),
    {
      dedupingInterval: 2000,
      fallbackData: [initialArticles],
      revalidateAll: false,
      revalidateFirstPage: true,
      revalidateOnFocus: false,
    },
  );
  const articles = useMemo(() => data ?? [], [data]);
  const isLoadingMore = useMemo(
    () => isValidating && size > 1,
    [isValidating, size],
  );
  const hasNextPage = useMemo(() => {
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd =
      isEmpty || (data && data[data.length - 1]?.length === 0);

    return !isReachingEnd;
  }, [data]);
  const { inView, ref } = useInView({
    rootMargin: "100px 0px",
    threshold: 0.1,
  });
  const allArticles = useMemo(() => articles.flat(), [articles]);
  const prevAllArticles = usePrevious(allArticles);
  const {
    setFalse: offIsLoading,
    setTrue: onIsLoading,
    value: isLoading,
  } = useBoolean(true);

  useEffect(() => {
    if (inView && hasNextPage && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [inView, hasNextPage, isLoadingMore, setSize, size]);

  useEffect(() => {
    if (
      JSON.stringify(allArticles.map(({ id }) => id)) ===
      JSON.stringify(prevAllArticles?.map(({ id }) => id))
    ) {
      setTimeout(() => offIsLoading(), 1000);

      return;
    }

    onIsLoading();
  }, [allArticles, offIsLoading, onIsLoading, prevAllArticles]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.texts}>
        {isLoading ? (
          <TailSpin height={24} radius="1" visible={true} width={24} />
        ) : null}
        <p className={styles.count}>{`${articlesCount.toLocaleString()}件`}</p>
        {category ? (
          <button
            onClick={() => {
              setCategory("");
            }}
            className={styles.badge}
          >
            <span>{category}</span>
            <IconCircleXFilled size={18} />
          </button>
        ) : null}
        {writer ? (
          <button
            onClick={() => {
              setWriter("");
            }}
            className={styles.badge}
          >
            <span>{writer}</span>
            <IconCircleXFilled size={18} />
          </button>
        ) : null}
        {from && to ? (
          <button
            onClick={() => {
              setFrom("");
              setTo("");
            }}
            className={styles.badge}
          >
            <span>{`${from.replaceAll("-", ".")} - ${to.replaceAll("-", ".")}`}</span>
            <IconCircleXFilled size={18} />
          </button>
        ) : null}
        {keyword
          ? keyword.split(" ").map((v, index) => (
              <button
                onClick={() => {
                  setKeyword(
                    keyword
                      .split(" ")
                      .filter((w) => v !== w)
                      .join(" "),
                  );
                }}
                className={styles.badge}
                key={index}
              >
                <span>{v}</span>
                <IconCircleXFilled size={18} />
              </button>
            ))
          : null}
      </div>
      <ul className={styles.list}>
        {allArticles.map(
          ({
            category: { name: categoryName },
            id,
            publishedAt,
            thumbnail,
            title,
            url,
            writers,
          }) => (
            <li className={styles.item} key={id}>
              <a href={url} target="_blank">
                <div className={styles.thumbnail}>
                  <Image
                    style={{
                      objectFit: "cover",
                    }}
                    alt={title}
                    decoding="async"
                    fill={true}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={`/api/proxy?url=${encodeURIComponent(thumbnail)}`}
                  />
                </div>
              </a>
              <div className={styles.detail}>
                <a href={url} target="_blank">
                  <span className={styles.title}>{title}</span>
                </a>
                <div className={styles.meta}>
                  <div>
                    <span
                      onClick={() => {
                        setCategory(categoryName);
                      }}
                      className={styles.category}
                    >
                      {categoryName}
                    </span>
                    {publishedAt && (
                      <>
                        {" / "}
                        <span>{format(publishedAt, "yyyy.MM.dd")}</span>
                      </>
                    )}
                  </div>
                  <div>
                    {writers.map(({ id, name }, index) => (
                      <Fragment key={id}>
                        {index > 0 && "・"}
                        <span
                          onClick={() => {
                            setWriter(name);
                          }}
                          className={styles.writer}
                        >
                          {name}
                        </span>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </li>
          ),
        )}
      </ul>
      <div className={styles.loading} ref={ref}>
        {hasNextPage && isLoadingMore ? (
          <TailSpin height={45} radius="1" visible={true} width={45} />
        ) : null}
        {!hasNextPage ? (
          <p className={styles.completed}>すべての記事を読み込みました</p>
        ) : null}
      </div>
    </div>
  );
}
