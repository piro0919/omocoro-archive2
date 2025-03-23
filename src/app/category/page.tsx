import prismaClient from "@/lib/prismaClient";
import { cookies } from "next/headers";
import { type JSX } from "react";
import Category from "./_components/Category";

// 12 時間
export const revalidate = 43200;

export default async function Page(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const isNotMovie = cookieStore.get("is-not-movie");
  const isNotOnigiri = cookieStore.get("is-not-onigiri");
  const isNotRadio = cookieStore.get("is-not-radio");
  const categories = await prismaClient.category.findMany({
    orderBy: {
      name: "asc",
    },
    where: {
      AND: [
        isNotMovie?.value === "true"
          ? {
              AND: [
                {
                  name: {
                    not: "オモコロチャンネル",
                  },
                },
                {
                  name: {
                    not: "ふっくらすずめクラブ",
                  },
                },
              ],
            }
          : {},
        isNotOnigiri?.value === "true"
          ? { isOnigiri: false }
          : // cookieがfalseの場合は条件なし（全件取得）
            {},
        isNotRadio?.value === "true"
          ? {
              AND: [
                {
                  name: {
                    not: "ラジオ",
                  },
                },
                {
                  name: {
                    not: "限定ラジオ",
                  },
                },
              ],
            }
          : {},
      ],
    },
  });

  return <Category categories={categories} />;
}
