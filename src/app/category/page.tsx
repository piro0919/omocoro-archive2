import prismaClient from "@/lib/prisma-client";
import { type Category } from "@prisma/client";
import CategoryComponent from "./_components/Category";

// 12 時間
export const revalidate = 43200;

type CategoryWithCount = Category & {
  _count: {
    articles: number;
  };
};

const getCategories = async (): Promise<CategoryWithCount[]> => {
  const categories = await prismaClient.category.findMany({
    include: {
      _count: {
        select: { articles: true },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return categories;
};

export default async function Page(): Promise<React.JSX.Element> {
  const categories = await getCategories();

  return <CategoryComponent categories={categories} />;
}
