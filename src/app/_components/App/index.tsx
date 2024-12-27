"use client";
import { type Article, type Category, type Writer } from "@prisma/client";
import { format } from "date-fns";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { Fragment, type JSX, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { TailSpin } from "react-loader-spinner";
import useSWR from "swr";
import { type StrictTupleKey } from "swr/_internal";
import useSWRInfinite from "swr/infinite";
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
  const [keyword] = useQueryState("keyword", parseAsString.withDefault(""));
  const [writer, setWriter] = useQueryState(
    "writer",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: false }),
  );
  const searchParamsObject = useMemo(
    () => ({
      category,
      keyword,
      writer,
    }),
    [category, keyword, writer],
  );
  const { data: articlesCount = initialArticlesCount } = useSWR(
    ["articlesCount", searchParamsObject],
    async () => fetchArticlesCount({ category, keyword, writer }),
    {
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
      fetchArticles({ category, keyword, page: pageIndex as number, writer }),
    {
      fallbackData: [initialArticles],
      revalidateOnFocus: false,
    },
  );
  const articles = useMemo(() => data ?? [], [data]);
  const isLoadingMore = isValidating && size > 1;
  const isEmpty = data?.[0]?.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.length === 0);
  const hasNextPage = !isReachingEnd;
  const { inView, ref } = useInView({
    rootMargin: "100px 0px",
    threshold: 0.1,
  });
  const allArticles = useMemo(() => articles.flat(), [articles]);

  useEffect(() => {
    if (inView && hasNextPage && !isLoadingMore) {
      setSize(size + 1);
    }
  }, [inView, hasNextPage, isLoadingMore, setSize, size]);

  return (
    <div className={styles.wrapper}>
      <p className={styles.count}>{`${articlesCount.toLocaleString()}件`}</p>
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
                    fill={true}
                    src={thumbnail}
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
