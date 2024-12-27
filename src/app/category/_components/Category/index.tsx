import { type Category as CategoryType } from "@prisma/client";
import Link from "next/link";
import { type JSX } from "react";
import styles from "./style.module.css";

export type CategoryProps = {
  categories: CategoryType[];
};

export default function Category({ categories }: CategoryProps): JSX.Element {
  return (
    <div className={styles.wrapper}>
      <ul className={styles.list}>
        {categories.map(({ id, name }) => (
          <li key={id}>
            <Link className={styles.link} href={`/?category=${name}`}>
              <span className={styles.name}>{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
