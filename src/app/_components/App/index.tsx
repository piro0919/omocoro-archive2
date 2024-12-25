"use client";

import { Article, Category, Writer } from "@prisma/client";
import { Fragment, JSX, useEffect, useMemo } from "react";
import styles from "./style.module.css";
import Link from "next/link";
import Image from "next/image";
import { useInView } from "react-intersection-observer";
import { fetchArticles } from "./actions";
import { format } from "date-fns";
import { useQueryState, parseAsString } from "nuqs";
import { useInfiniteQuery } from "@tanstack/react-query";

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
  const [writer, setWriter] = useQueryState(
    "writer",
    parseAsString
      .withDefault("")
      .withOptions({ history: "push", scroll: true, shallow: true }),
  );
  const searchParamsObject = useMemo(
    () => ({
      category,
      writer,
    }),
    [category, writer],
  );
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["articles", searchParamsObject],
      queryFn: ({ pageParam }) =>
        fetchArticles({ category, page: pageParam, writer }),
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 0 ? undefined : allPages.length,
      initialData: {
        pages: [initialArticles],
        pageParams: [0],
      },
    });
  const { ref, inView } = useInView({
    rootMargin: "100px 0px",
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allArticles = data?.pages.flat() ?? [];

  return (
    <>
      <ul className={styles.list}>
        {allArticles.map(
          ({
            category: { name: categoryName },
            publishedAt,
            id,
            title,
            url,
            thumbnail,
            writers,
          }) => (
            <li className={styles.item} key={id}>
              <Link href={url} target="_blank">
                <div className={styles.thumbnail}>
                  <Image
                    alt={title}
                    src={thumbnail}
                    fill={true}
                    style={{
                      objectFit: "cover",
                    }}
                  />
                </div>
              </Link>
              <div className={styles.detail}>
                <Link href={url} target="_blank">
                  <span className={styles.title}>{title}</span>
                </Link>
                <div className={styles.meta}>
                  <div>
                    <span onClick={() => setCategory(categoryName)}>
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
                    {writers.map(({ name, id }, index) => (
                      <Fragment key={id}>
                        {index > 0 && "・"}
                        <span onClick={() => setWriter(name)}>{name}</span>
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
        {hasNextPage && isFetchingNextPage ? <div>Loading...</div> : null}
        {!hasNextPage ? <div>すべての記事を読み込みました</div> : null}
      </div>
    </>
  );
}
