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
  const { category, from, keyword, order, to, writer } =
    await searchParamsCache.parse(searchParams);

  if (keyword) {
    noStore();
  }

  const initialArticles = await fetchArticles({
    category,
    from,
    keyword,
    order,
    page: 0,
    to,
    writer,
  });
  const initialArticlesCount = await fetchArticlesCount({
    category,
    from,
    keyword,
    to,
    writer,
  });

  return (
    <App
      initialArticles={initialArticles}
      initialArticlesCount={initialArticlesCount}
    />
  );
}
