"use server";
import prismaClient from "@/lib/prismaClient";
import { type Article, type Category, type Writer } from "@prisma/client";
import { fromZonedTime } from "date-fns-tz";
import { cookies } from "next/headers";

type FetchArticlesParams = {
  category?: string;
  from?: string;
  keyword?: string;
  order?: "asc" | "desc";
  page: number;
  to?: string;
  writer?: string;
};

type FetchArticlesCountParams = Omit<FetchArticlesParams, "order" | "page">;

export async function fetchArticles({
  category,
  from,
  keyword,
  order = "desc",
  page,
  to,
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
          ...(typeof from === "string" &&
          from.length > 0 &&
          typeof to === "string" &&
          to.length > 0
            ? [
                {
                  publishedAt: {
                    gte: fromZonedTime(from, "Asia/Tokyo"),
                    lte: fromZonedTime(to, "Asia/Tokyo"),
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
  from,
  keyword,
  to,
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
          ...(typeof from === "string" &&
          from.length > 0 &&
          typeof to === "string" &&
          to.length > 0
            ? [
                {
                  publishedAt: {
                    gte: fromZonedTime(from, "Asia/Tokyo"),
                    lte: fromZonedTime(to, "Asia/Tokyo"),
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
