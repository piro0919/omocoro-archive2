"use server";

import prismaClient from "@/lib/prismaClient";

export async function fetchArticles({
  category,
  page,
  writer,
}: {
  category?: string;
  page: number;
  writer?: string;
}) {
  const articles = await prismaClient.article.findMany({
    orderBy: {
      publishedAt: "desc",
    },
    take: 24,
    skip: page * 24,
    include: {
      category: true,
      writers: true,
    },
    where: {
      category: category
        ? {
            name: {
              equals: category,
            },
          }
        : undefined,
      writers: writer
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
