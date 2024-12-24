import { PrismaClient } from "@prisma/client";
import sleep from "sleep-promise";
import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";

dotenv.config({ path: ".env.development.local" });

if (!process.env.POSTGRES_PRISMA_URL) {
  throw new Error("POSTGRES_PRISMA_URL is not set in .env.development.local");
}

if (!process.env.VERCEL_POSTGRES_URL) {
  throw new Error("VERCEL_POSTGRES_URL is not set in .env.development.local");
}

const dockerPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL,
    },
  },
  log: ["warn", "error"],
});

const vercelPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.VERCEL_POSTGRES_URL,
    },
  },
  log: ["warn", "error"],
});

// 設定値の調整
const BATCH_SIZE = 5;
const TRANSACTION_BATCH_SIZE = 2;
const SLEEP_MS = 2000;
const RETRY_ATTEMPTS = 5;
const TRANSACTION_TIMEOUT = 10000;

// 進捗ファイルのパス
const PROGRESS_FILE = path.join(
  process.cwd(),
  "prisma",
  "migration-progress.json",
);

// 進捗の型定義
interface MigrationProgress {
  categories: boolean;
  writers: boolean;
  articles: {
    completed: boolean;
    lastProcessedId: string | null;
    processedCount: number;
  };
}

// コマンドライン引数からの開始位置の取得
const START_FROM = parseInt(process.argv[2] || "0", 10);

// 進捗の読み込み
async function loadProgress(): Promise<MigrationProgress> {
  try {
    const content = await fs.readFile(PROGRESS_FILE, "utf-8");
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return JSON.parse(content);
  } catch {
    return {
      categories: true,
      writers: true,
      articles: {
        completed: false,
        lastProcessedId: null,
        processedCount: START_FROM,
      },
    };
  }
}

// 進捗の保存
async function saveProgress(progress: MigrationProgress): Promise<void> {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function withRetry(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation: () => Promise<any>,
  name: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  for (let i = 0; i < RETRY_ATTEMPTS; i++) {
    try {
      const startTime = Date.now();
      const result = await operation();
      const duration = Date.now() - startTime;
      console.log(`✓ ${name} completed in ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`✗ Error in ${name} (attempt ${i + 1}/${RETRY_ATTEMPTS}):`);
      if (error instanceof Error) {
        console.error(`  ${error.message}`);
      } else {
        console.error(`  ${String(error)}`);
      }
      if (i === RETRY_ATTEMPTS - 1) {
        throw error;
      }
      const waitTime = SLEEP_MS * (i + 1);
      console.log(`  Waiting ${waitTime}ms before retry...`);
      await sleep(waitTime);
    }
  }
}

async function migrateCategories() {
  console.log("\n📊 Starting categories migration...");
  const startTime = Date.now();

  const categories = await dockerPrisma.category.findMany();
  console.log(`Found ${categories.length} categories in source database`);

  for (let i = 0; i < categories.length; i += TRANSACTION_BATCH_SIZE) {
    const batch = categories.slice(i, i + TRANSACTION_BATCH_SIZE);
    await withRetry(
      async () => {
        await vercelPrisma.$transaction(
          async (tx) => {
            for (const category of batch) {
              console.log(`  Processing category: ${category.name}`);
              await tx.category.upsert({
                where: { name: category.name },
                create: {
                  id: category.id,
                  name: category.name,
                },
                update: {},
              });
            }
          },
          {
            timeout: TRANSACTION_TIMEOUT,
          },
        );
      },
      `categories batch ${i + 1}-${i + batch.length}`,
    );

    if (i + TRANSACTION_BATCH_SIZE < categories.length) {
      await sleep(SLEEP_MS);
    }
  }

  const duration = Date.now() - startTime;
  console.log(`✓ Categories migration completed in ${duration}ms`);
}

async function migrateWriters() {
  console.log("\n✍️ Starting writers migration...");
  const startTime = Date.now();

  const totalWriters = await dockerPrisma.writer.count();
  console.log(`Found ${totalWriters} writers in source database`);

  let processedCount = 0;
  let lastId: string | null = null;
  const batchStartTime = Date.now();

  while (processedCount < totalWriters) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const findManyOptions = {
      take: BATCH_SIZE,
      orderBy: {
        id: "asc" as const,
      },
      ...(lastId && {
        cursor: { id: lastId },
        skip: 1,
      }),
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const writers = await dockerPrisma.writer.findMany(findManyOptions);

    if (writers.length === 0) break;

    for (let i = 0; i < writers.length; i += TRANSACTION_BATCH_SIZE) {
      const transactionBatch = writers.slice(i, i + TRANSACTION_BATCH_SIZE);

      await withRetry(
        async () => {
          await vercelPrisma.$transaction(
            async (tx) => {
              for (const writer of transactionBatch) {
                await tx.writer.upsert({
                  where: { name: writer.name },
                  create: {
                    id: writer.id,
                    name: writer.name,
                    profileUrl: writer.profileUrl,
                    avatarUrl: writer.avatarUrl,
                    createdAt: writer.createdAt,
                    updatedAt: writer.updatedAt,
                  },
                  update: {},
                });
              }
            },
            {
              timeout: TRANSACTION_TIMEOUT,
            },
          );
        },
        `writers batch ${processedCount + i + 1}-${processedCount + i + transactionBatch.length}`,
      );

      if (i + TRANSACTION_BATCH_SIZE < writers.length) {
        await sleep(SLEEP_MS / 2);
      }
    }

    processedCount += writers.length;
    lastId = writers[writers.length - 1].id;
    const progress = (processedCount / totalWriters) * 100;
    const elapsedTime = Date.now() - batchStartTime;
    const estimatedTimeRemaining =
      (elapsedTime / processedCount) * (totalWriters - processedCount);

    console.log(
      `  Batch completed: ${processedCount}/${totalWriters} writers (${progress.toFixed(1)}%)`,
    );
    console.log(
      `  Estimated time remaining: ${Math.ceil(estimatedTimeRemaining / 1000)}s`,
    );

    await sleep(SLEEP_MS);
  }

  const duration = Date.now() - startTime;
  console.log(`✓ Writers migration completed in ${duration}ms`);
}

async function migrateArticles(
  startFromId: string | null = null,
  processedCount: number = 0,
) {
  console.log("\n📝 Starting articles migration...");
  if (startFromId) {
    console.log(`Resuming from article ID: ${startFromId}`);
  }
  console.log(`Starting from: ${processedCount} articles`);

  const startTime = Date.now();
  const totalArticles = await dockerPrisma.article.count();
  console.log(`Found ${totalArticles} articles in source database`);

  let currentProcessedCount = processedCount;
  let lastId = startFromId;
  const batchStartTime = Date.now();

  // 5800件からの再開時のスキップ処理
  if (currentProcessedCount === 5800 && !lastId) {
    const skipArticles = await dockerPrisma.article.findMany({
      take: 1,
      skip: currentProcessedCount - 1,
      orderBy: {
        id: "asc",
      },
    });
    if (skipArticles.length > 0) {
      lastId = skipArticles[0].id;
      console.log(`Skipped to article ID: ${lastId}`);
    }
  }

  while (currentProcessedCount < totalArticles) {
    try {
      const findManyOptions = {
        take: BATCH_SIZE,
        orderBy: {
          id: "asc" as const,
        },
        include: {
          writers: {
            select: {
              id: true,
            },
          },
          category: true,
        },
        ...(lastId && {
          cursor: { id: lastId },
          skip: 1,
        }),
      };

      const articles = await dockerPrisma.article.findMany(findManyOptions);

      if (articles.length === 0) break;

      for (let i = 0; i < articles.length; i += TRANSACTION_BATCH_SIZE) {
        const transactionBatch = articles.slice(i, i + TRANSACTION_BATCH_SIZE);

        await withRetry(
          async () => {
            await vercelPrisma.$transaction(
              async (tx) => {
                for (const article of transactionBatch) {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { writers, category, ...articleData } = article;

                  const { publishedAt, ...restArticleData } = articleData;
                  const createData = {
                    ...restArticleData,
                    ...(publishedAt ? { publishedAt } : {}),
                    categoryId: article.categoryId,
                    writers: {
                      connect: writers.map((writer) => ({ id: writer.id })),
                    },
                  };

                  await tx.article.upsert({
                    where: { url: article.url },
                    create: createData,
                    update: {},
                  });
                }
              },
              {
                timeout: TRANSACTION_TIMEOUT,
              },
            );
          },
          `articles batch ${currentProcessedCount + i + 1}-${currentProcessedCount + i + transactionBatch.length}`,
        );

        // バッチごとに進捗を保存
        await saveProgress({
          categories: true,
          writers: true,
          articles: {
            completed: false,
            lastProcessedId: articles[articles.length - 1].id,
            processedCount: currentProcessedCount + i + transactionBatch.length,
          },
        });

        await sleep(SLEEP_MS / 2);
      }

      currentProcessedCount += articles.length;
      lastId = articles[articles.length - 1].id;

      const progress = (currentProcessedCount / totalArticles) * 100;
      const elapsedTime = Date.now() - batchStartTime;
      const estimatedTimeRemaining =
        (elapsedTime / currentProcessedCount) *
        (totalArticles - currentProcessedCount);

      console.log(
        `  Batch completed: ${currentProcessedCount}/${totalArticles} articles (${progress.toFixed(1)}%)`,
      );
      console.log(
        `  Estimated time remaining: ${Math.ceil(estimatedTimeRemaining / 1000)}s`,
      );
      console.log(`  Current article: ${articles[articles.length - 1].title}`);
      console.log(`  Current article ID: ${lastId}`);

      await sleep(SLEEP_MS);
    } catch (error) {
      console.error(`Error processing batch after ID ${lastId}:`, error);
      throw error;
    }
  }

  // 完了時に進捗をクリア
  await saveProgress({
    categories: true,
    writers: true,
    articles: {
      completed: true,
      lastProcessedId: null,
      processedCount: currentProcessedCount,
    },
  });

  const duration = Date.now() - startTime;
  console.log(`✓ Articles migration completed in ${duration}ms`);
}

async function main() {
  try {
    console.log("🚀 Starting database migration");
    console.log("\nConfiguration:");
    console.log(`Source database: ${process.env.POSTGRES_PRISMA_URL}`);
    console.log(`Target database: ${process.env.VERCEL_POSTGRES_URL}`);
    console.log(`Batch size: ${BATCH_SIZE}`);
    console.log(`Transaction batch size: ${TRANSACTION_BATCH_SIZE}`);
    console.log(`Transaction timeout: ${TRANSACTION_TIMEOUT}ms`);
    console.log(`Sleep between batches: ${SLEEP_MS}ms`);
    console.log(`Retry attempts: ${RETRY_ATTEMPTS}`);

    // 進捗の読み込み
    const progress = await loadProgress();
    console.log("\nLoaded progress:", progress);

    if (!progress.categories) {
      await migrateCategories();
      await sleep(SLEEP_MS);
      progress.categories = true;
      await saveProgress(progress);
    } else {
      console.log("Skipping categories migration (already completed)");
    }

    if (!progress.writers) {
      await migrateWriters();
      await sleep(SLEEP_MS);
      progress.writers = true;
      await saveProgress(progress);
    } else {
      console.log("Skipping writers migration (already completed)");
    }

    if (!progress.articles.completed) {
      await migrateArticles(
        progress.articles.lastProcessedId,
        progress.articles.processedCount,
      );
    } else {
      console.log("Skipping articles migration (already completed)");
    }

    await fs.unlink(PROGRESS_FILE).catch(() => {}); // 完了時に進捗ファイルを削除

    console.log("\n✨ Migration completed successfully");
  } catch (error) {
    console.error("\n❌ Migration failed:");
    console.error(error);
    process.exit(1);
  } finally {
    console.log("\n🔄 Closing database connections...");
    await dockerPrisma.$disconnect();
    await vercelPrisma.$disconnect();
  }
}

process.on("unhandledRejection", (error) => {
  console.error("\n❌ Unhandled rejection:", error);
  process.exit(1);
});

main().catch(async (e) => {
  console.error("\n❌ Fatal error:", e);
  await dockerPrisma.$disconnect();
  await vercelPrisma.$disconnect();
  process.exit(1);
});
