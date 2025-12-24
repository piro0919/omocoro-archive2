"use client";
import { type Writer } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import styles from "./style.module.css";

export type WriterProps = Readonly<{
  writers: Writer[];
}>;

export default function Writer({ writers }: WriterProps): React.JSX.Element {
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {writers.map((writer) => (
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
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
