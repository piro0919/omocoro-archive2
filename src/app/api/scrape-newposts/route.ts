import prismaClient from "@/lib/prismaClient";
import * as cheerio from "cheerio";
import { NextResponse } from "next/server";
import sleep from "sleep-promise";
import { type Element } from "domhandler";

const RETRY_DELAY = 2000;
const PAGE_DELAY = 1000;
const MAX_RETRIES = 5;
const BASE_URL = "https://omocoro.jp";

type Writer = {
  id: string;
  name: string;
  avatarUrl?: string;
  profileUrl?: string;
};

type ArticleInput = {
  title: string;
  url: string;
  thumbnail: string;
  publishedAt: Date | null;
  category: string;
};

function extractArticleData(
  $: cheerio.CheerioAPI,
  article: cheerio.Cheerio<Element>,
): ArticleInput | null {
  try {
    const title = article.find(".title").text().trim();
    const url = article.find(".image a").attr("href");
    const thumbnail = article.find(".image img").attr("src") ?? "";
    const category = article.find(".category").text().trim();
    const publishedAtStr = article.find(".date").text().trim();

    if (!url || !title || !category) {
      console.log(`Skipping invalid article: ${title || "No title"}`);
      return null;
    }

    let publishedAt: Date | null = null;
    if (publishedAtStr) {
      try {
        publishedAt = new Date(publishedAtStr);
        if (isNaN(publishedAt.getTime())) {
          publishedAt = null;
        }
      } catch {
        console.log(`Invalid date for article: ${title}`);
      }
    }

    return { title, url, thumbnail, category, publishedAt };
  } catch (error) {
    console.error("Error extracting article data:", error);
    return null;
  }
}

async function processWriters(
  $: cheerio.CheerioAPI,
  article: cheerio.Cheerio<Element>,
  existingWriters: Writer[],
): Promise<string[]> {
  const writerIds: string[] = [];

  try {
    const staffElements = article.find(".staffs a");

    for (const staffElement of staffElements) {
      const $staff = $(staffElement);
      const name = $staff.text().trim();

      if (!name) continue;

      const existingWriter = existingWriters.find((w) => w.name === name);
      if (existingWriter) {
        writerIds.push(existingWriter.id);
        continue;
      }

      const avatarUrl = $staff.find("img").attr("src") ?? "";
      const profileUrl = $staff.attr("href") ?? "";

      try {
        const newWriter = await prismaClient.writer.create({
          data: { name, avatarUrl, profileUrl },
        });
        writerIds.push(newWriter.id);
        existingWriters.push(newWriter);
      } catch (error) {
        console.error(`Failed to create writer: ${name}`, error);
      }
    }
  } catch (error) {
    console.error("Error processing writers:", error);
  }

  return writerIds;
}

async function processArticle(
  $: cheerio.CheerioAPI,
  articleElement: Element,
  writers: Writer[],
): Promise<void> {
  const $article = $(articleElement);
  const articleData = extractArticleData($, $article);

  if (!articleData) {
    throw new Error("Failed to extract article data");
  }

  try {
    const writerIds = await processWriters($, $article, writers);

    // カテゴリーの作成と記事の作成/更新を1つのトランザクションで実行
    await prismaClient.$transaction(async (tx) => {
      // カテゴリーの作成または取得
      const category = await tx.category.upsert({
        where: { name: articleData.category },
        create: { name: articleData.category },
        update: {},
      });

      // 記事の作成または更新
      await tx.article.upsert({
        where: { url: articleData.url },
        create: {
          title: articleData.title,
          url: articleData.url,
          thumbnail: articleData.thumbnail,
          publishedAt: articleData.publishedAt,
          category: { connect: { id: category.id } },
          writers: { connect: writerIds.map((id) => ({ id })) },
        },
        update: {
          title: articleData.title,
          thumbnail: articleData.thumbnail,
          publishedAt: articleData.publishedAt,
          category: { connect: { id: category.id } },
          writers: { set: writerIds.map((id) => ({ id })) },
        },
      });
    });
  } catch (error) {
    console.error("Error processing article:", {
      title: articleData.title,
      url: articleData.url,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}

async function fetchAndProcessPage(
  url: string,
  writers: Writer[],
): Promise<number> {
  let failedArticles = 0;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articleElements =
      url === BASE_URL
        ? $(".new-entries .box:not(.ad)")
        : $(".category-inner .box:not(.ad)");

    console.log(`Processing ${url}: ${articleElements.length} articles`);

    for (const articleElement of articleElements) {
      let succeeded = false;

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await processArticle($, articleElement, writers);
          succeeded = true;
          break;
        } catch (error) {
          console.log(
            `Processing failed (attempt ${attempt}/${MAX_RETRIES}): ${
              error instanceof Error ? error.message : "Unknown error"
            }`,
          );

          if (attempt === MAX_RETRIES) {
            failedArticles++;
          } else {
            await sleep(RETRY_DELAY);
          }
        }
      }

      if (!succeeded) {
        console.error("Failed to process article after all attempts");
      }
    }
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    throw error;
  }

  return failedArticles;
}

export async function GET(): Promise<NextResponse> {
  try {
    const writers = await prismaClient.writer.findMany();
    let totalFailedArticles = 0;

    // メインページの処理
    totalFailedArticles += await fetchAndProcessPage(BASE_URL, writers);
    await sleep(PAGE_DELAY);

    // 続きのページを処理
    let page = 1;
    let consecutiveEmptyPages = 0;

    while (true) {
      try {
        const pageUrl = `${BASE_URL}/newpost/page/${page}`;
        const pageFailures = await fetchAndProcessPage(pageUrl, writers);

        if (pageFailures === 0 && page > 1) {
          consecutiveEmptyPages++;
          if (consecutiveEmptyPages >= 2) {
            break;
          }
        } else {
          consecutiveEmptyPages = 0;
        }

        totalFailedArticles += pageFailures;
        page++;
        await sleep(PAGE_DELAY);
      } catch (error) {
        console.error(`Failed to process page ${page}:`, error);
        break;
      }
    }

    return NextResponse.json({
      success: true,
      lastProcessedPage: page - 1,
      failedArticles: totalFailedArticles,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
