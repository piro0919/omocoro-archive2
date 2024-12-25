import { unstable_noStore as noStore } from "next/cache";
import App from "./_components/App";
import { fetchArticles } from "./_components/App/actions";
import { type SearchParams } from "nuqs/server";
import searchParamsCache from "./searchParamsCache";

export const dynamic = "auto";
// 24 時間
export const revalidate = 86400;

type PageProps = {
  searchParams: Promise<SearchParams>; // Next.js 15+: async searchParams prop
};

export default async function Page({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { category, writer } = await searchParamsCache.parse(searchParams);

  if (category || writer) {
    noStore();
  }

  const initialArticles = await fetchArticles({ category, page: 0, writer });

  return <App initialArticles={initialArticles} />;
}
