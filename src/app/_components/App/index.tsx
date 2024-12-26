"use client";
import { type Article, type Category, type Writer } from "@prisma/client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Image from "next/image";
import { parseAsString, useQueryState } from "nuqs";
import { Fragment, type JSX, useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { fetchArticles } from "./actions";
import styles from "./style.module.css";

export type AppProps = {
  initialArticles: (Article & { category: Category; writers: Writer[] })[];
};

export default function App({ initialArticles }: AppProps): JSX.Element {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: true }),
  );
  const [keyword] = useQueryState("keyword", parseAsString.withDefault(""));
  const [writer, setWriter] = useQueryState(
    "writer",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: true }),
  );
  const searchParamsObject = useMemo(
    () => ({
      category,
      keyword,
      writer,
    }),
    [category, keyword, writer],
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 0 ? undefined : allPages.length,
      initialData: {
        pageParams: [0],
        pages: [initialArticles],
      },
      initialPageParam: 0,
      queryFn: async ({ pageParam }) =>
        fetchArticles({ category, keyword, page: pageParam, writer }),
      queryKey: ["articles", searchParamsObject],
    });
  const { inView, ref } = useInView({
    rootMargin: "100px 0px",
    threshold: 0.1,
  });
  const allArticles = useMemo(() => data?.pages.flat() ?? [], [data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={styles.wrapper}>
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
      <div ref={ref}>
        {hasNextPage && isFetchingNextPage ? <p>Loading...</p> : null}
        {!hasNextPage ? <p>すべての記事を読み込みました</p> : null}
      </div>
    </div>
  );
}
