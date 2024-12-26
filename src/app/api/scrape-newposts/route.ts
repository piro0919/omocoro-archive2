import prismaClient from "@/lib/prismaClient";
import * as cheerio from "cheerio";
import { type Element } from "domhandler";
import { type NextRequest, NextResponse } from "next/server";
import sleep from "sleep-promise";

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

    if (!(typeof url === "string" && url.length > 0) || !title || !category) {
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

    return { category, publishedAt, thumbnail, title, url };
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
          data: { avatarUrl, name, profileUrl },
        });

        writerIds.push(newWriter.id);
        existingWriters.push(newWriter);
        console.log(`New writer created: ${name}`);
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
    console.log(`Processing: ${articleData.title}`);

    const writerIds = await processWriters($, $article, writers);

    // カテゴリーの作成と記事の作成/更新を1つのトランザクションで実行
    await prismaClient.$transaction(async (tx) => {
      // カテゴリーの作成または取得
      const category = await tx.category.upsert({
        create: { name: articleData.category },
        update: {},
        where: { name: articleData.category },
      });

      // 記事の作成または更新
      await tx.article.upsert({
        create: {
          category: { connect: { id: category.id } },
          publishedAt: articleData.publishedAt,
          thumbnail: articleData.thumbnail,
          title: articleData.title,
          url: articleData.url,
          writers: { connect: writerIds.map((id) => ({ id })) },
        },
        update: {
          category: { connect: { id: category.id } },
          publishedAt: articleData.publishedAt,
          thumbnail: articleData.thumbnail,
          title: articleData.title,
          writers: { set: writerIds.map((id) => ({ id })) },
        },
        where: { url: articleData.url },
      });
    });
  } catch (error) {
    console.error("Error processing article:", {
      error: error instanceof Error ? error.message : "Unknown error",
      title: articleData.title,
      url: articleData.url,
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

    console.log(`Found ${articleElements.length} articles on ${url}`);

    for (const articleElement of articleElements) {
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          await processArticle($, articleElement, writers);

          break;
        } catch {
          if (attempt === MAX_RETRIES) {
            failedArticles++;
            console.log(
              `Failed to process article after ${MAX_RETRIES} attempts`,
            );
          } else {
            await sleep(RETRY_DELAY);
          }
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    throw error;
  }

  return failedArticles;
}

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest): Promise<NextResponse> {
  console.log("Starting scraping process");

  const authHeader = request.headers.get("authorization");

  if (
    process.env.NODE_ENV !== "development" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        success: false,
      },
      { status: 401 },
    );
  }

  try {
    const writers = await prismaClient.writer.findMany();

    console.log(`Found ${writers.length} existing writers`);

    let totalFailedArticles = 0;

    // メインページの処理
    console.log("Processing main page");
    totalFailedArticles += await fetchAndProcessPage(BASE_URL, writers);
    await sleep(PAGE_DELAY);

    // 続きのページを処理
    let page = 1;
    let consecutiveEmptyPages = 0;

    while (true) {
      try {
        const pageUrl = `${BASE_URL}/newpost/page/${page}`;

        console.log(`Processing page ${page}`);

        const pageFailures = await fetchAndProcessPage(pageUrl, writers);

        if (pageFailures === 0 && page > 1) {
          consecutiveEmptyPages++;

          if (consecutiveEmptyPages >= 2) {
            console.log("Finished - found 2 consecutive empty pages");

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

    console.log(
      `Scraping completed. Failed articles: ${totalFailedArticles}, Last page: ${page - 1}`,
    );

    return NextResponse.json({
      failedArticles: totalFailedArticles,
      lastProcessedPage: page - 1,
      success: true,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("Fatal error:", errorMessage);

    return NextResponse.json(
      {
        details: error instanceof Error ? error.stack : undefined,
        error: errorMessage,
        success: false,
      },
      { status: 500 },
    );
  }
}
