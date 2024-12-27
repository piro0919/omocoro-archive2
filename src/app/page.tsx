import { unstable_noStore as noStore } from "next/cache";
import { type SearchParams } from "nuqs/server";
import { type JSX } from "react";
import App from "./_components/App";
import { fetchArticles, fetchArticlesCount } from "./_components/App/actions";
import searchParamsCache from "./searchParamsCache";

export const dynamic = "auto";

// 12 時間
export const revalidate = 43200;

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function Page({
  searchParams,
}: PageProps): Promise<JSX.Element> {
  const { category, keyword, order, writer } =
    await searchParamsCache.parse(searchParams);

  if (category || keyword || writer) {
    noStore();
  }

  const initialArticles = await fetchArticles({
    category,
    keyword,
    order,
    page: 0,
    writer,
  });
  const initialArticlesCount = await fetchArticlesCount({
    category,
    keyword,
    writer,
  });

  return (
    <App
      initialArticles={initialArticles}
      initialArticlesCount={initialArticlesCount}
    />
  );
}
