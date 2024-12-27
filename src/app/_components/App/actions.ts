"use server";
import prismaClient from "@/lib/prismaClient";
import { type Article, type Category, type Writer } from "@prisma/client";
import { cookies } from "next/headers";

type FetchArticlesParams = {
  category?: string;
  keyword?: string;
  order?: "asc" | "desc";
  page: number;
  writer?: string;
};

type FetchArticlesCountParams = Omit<FetchArticlesParams, "page">;

export async function fetchArticles({
  category,
  keyword,
  order = "desc",
  page,
  writer,
}: FetchArticlesParams): Promise<
  (Article & { category: Category; writers: Writer[] })[]
> {
  const cookieStore = await cookies();
  const isNotOnigiri = cookieStore.get("is-not-onigiri");

  try {
    const articles = await prismaClient.article.findMany({
      include: {
        category: true,
        writers: true,
      },
      orderBy: {
        publishedAt: order,
      },
      skip: page * 24,
      take: 24,
      where: {
        AND: [
          ...(typeof keyword === "string" && keyword.length > 0
            ? keyword.split(" ").map((v) => ({
                title: { contains: v, mode: "insensitive" as const },
              }))
            : []),
          ...(typeof category === "string" && category.length > 0
            ? [
                {
                  category: {
                    name: { equals: category },
                    ...(isNotOnigiri ? { isOnigiri: false } : {}),
                  },
                },
              ]
            : [
                {
                  category: {
                    ...(isNotOnigiri ? { isOnigiri: false } : {}),
                  },
                },
              ]),
          ...(typeof writer === "string" && writer.length > 0
            ? [
                {
                  writers: {
                    some: { name: { equals: writer } },
                  },
                },
              ]
            : []),
        ],
      },
    });

    return articles;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error fetching articles: ${error.message}`);
    } else {
      console.error("Unknown error occurred while fetching articles");
    }

    return [];
  }
}

export async function fetchArticlesCount({
  category,
  keyword,
  writer,
}: FetchArticlesCountParams): Promise<number> {
  const cookieStore = await cookies();
  const isNotOnigiri = cookieStore.get("is-not-onigiri");

  try {
    const count = await prismaClient.article.count({
      where: {
        AND: [
          ...(typeof keyword === "string" && keyword.length > 0
            ? keyword.split(" ").map((v) => ({
                title: { contains: v, mode: "insensitive" as const },
              }))
            : []),
          ...(typeof category === "string" && category.length > 0
            ? [
                {
                  category: {
                    name: { equals: category },
                    ...(isNotOnigiri ? { isOnigiri: false } : {}),
                  },
                },
              ]
            : [
                {
                  category: {
                    ...(isNotOnigiri ? { isOnigiri: false } : {}),
                  },
                },
              ]),
          ...(typeof writer === "string" && writer.length > 0
            ? [
                {
                  writers: {
                    some: { name: { equals: writer } },
                  },
                },
              ]
            : []),
        ],
      },
    });

    return count;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(`Error counting articles: ${error.message}`);
    } else {
      console.error("Unknown error occurred while counting articles");
    }

    return 0;
  }
}
