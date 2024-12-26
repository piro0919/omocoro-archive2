"use server";
import prismaClient from "@/lib/prismaClient";
import { type Article, type Category, type Writer } from "@prisma/client";

// eslint-disable-next-line import/prefer-default-export
export async function fetchArticles({
  category,
  keyword,
  page,
  writer,
}: {
  category?: string;
  keyword?: string;
  page: number;
  writer?: string;
}): Promise<(Article & { category: Category; writers: Writer[] })[]> {
  const articles = await prismaClient.article.findMany({
    include: {
      category: true,
      writers: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    skip: page * 24,
    take: 24,
    where: {
      AND:
        typeof keyword === "string" && keyword.length > 0
          ? keyword.split(" ").map((v) => ({
              OR: [
                {
                  title: { contains: v, mode: "insensitive" },
                },
              ],
            }))
          : undefined,
      category:
        typeof category === "string" && category.length > 0
          ? {
              name: {
                equals: category,
              },
            }
          : undefined,
      writers:
        typeof writer === "string" && writer.length > 0
          ? {
              some: {
                name: {
                  equals: writer,
                },
              },
            }
          : undefined,
    },
  });

  return articles;
}
