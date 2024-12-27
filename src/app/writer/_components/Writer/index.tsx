import { type Writer as WriterType } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { type JSX } from "react";
import styles from "./style.module.css";

export type WriterProps = {
  writers: WriterType[];
};

export default function Writer({ writers }: WriterProps): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {writers.map(({ avatarUrl, id, name }) => (
          <li key={id}>
            <Link className={styles.link} href={`/?writer=${name}`}>
              <Image
                alt={name}
                decoding="async"
                height={45}
                loading="lazy"
                src={avatarUrl}
                width={45}
              />
              <span className={styles.name}>{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
