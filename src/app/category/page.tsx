import prismaClient from "@/lib/prisma-client";
import { type Category } from "@prisma/client";
import CategoryComponent from "./_components/Category";

// 12 時間
export const revalidate = 43200;

const getCategories = async (): Promise<Category[]> => {
  const categories = await prismaClient.category.findMany({
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
