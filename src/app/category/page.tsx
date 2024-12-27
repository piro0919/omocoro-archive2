import prismaClient from "@/lib/prismaClient";
import { cookies } from "next/headers";
import { type JSX } from "react";
import Category from "./_components/Category";

// 12 時間
export const revalidate = 43200;

export default async function Page(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const isNotOnigiri = cookieStore.get("is-not-onigiri");
  const categories = await prismaClient.category.findMany({
    orderBy: {
      name: "asc",
    },
    where:
      isNotOnigiri?.value === "true"
        ? { isOnigiri: false }
        : // cookieがfalseの場合は条件なし（全件取得）
          {},
  });

  return <Category categories={categories} />;
}
