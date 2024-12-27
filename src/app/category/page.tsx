import prismaClient from "@/lib/prismaClient";
import { type JSX } from "react";
import Category from "./_components/Category";

// 12 時間
export const revalidate = 43200;

export default async function Page(): Promise<JSX.Element> {
  const categories = await prismaClient.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <Category categories={categories} />;
}
