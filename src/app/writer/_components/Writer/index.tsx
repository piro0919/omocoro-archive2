"use client";
import { type Writer } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import styles from "./style.module.css";

type WriterWithCount = Writer & {
  _count: {
    articles: number;
  };
};

export type WriterProps = Readonly<{
  writers: WriterWithCount[];
}>;

export default function Writer({ writers }: WriterProps): React.JSX.Element {
  const [order, setOrder] = useState<"count" | "name">("name");

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.button}
          disabled={order === "name"}
          onClick={() => setOrder("name")}
        >
          名前順
        </button>
        <button
          className={styles.button}
          disabled={order === "count"}
          onClick={() => setOrder("count")}
        >
          記事数順
        </button>
      </div>
      <ul className={styles.list}>
        {writers
          .sort((a, b) => {
            if (order === "name") {
              return a.name.localeCompare(b.name);
            }

            return b._count.articles - a._count.articles;
          })
          .map((writer) => (
            <li className={styles.item} key={writer.id}>
              <Link className={styles.link} href={`/?writer=${writer.name}`}>
                <div className={styles.imageContainer}>
                  <Image
                    alt={writer.name}
                    className={styles.image}
                    decoding="async"
                    fill={true}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    src={`/api/proxy?url=${encodeURIComponent(writer.avatarUrl)}`}
                  />
                </div>
                <div className={styles.name}>{writer.name}</div>
                <div className={styles.count}>
                  {writer._count.articles.toLocaleString()} 本
                </div>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
