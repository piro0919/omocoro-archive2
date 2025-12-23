import prismaClient from "@/lib/prisma-client";
import { type NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line import/prefer-default-export
export async function GET(request: NextRequest): Promise<NextResponse<number>> {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const isNotMovie = searchParams.get("isNotMovie");
  const isNotOnigiri = searchParams.get("isNotOnigiri");
  const isNotRadio = searchParams.get("isNotRadio");
  const keyword = searchParams.get("keyword");
  const writer = searchParams.get("writer");
  const excludeCategories = [
    ...(isNotMovie === "true"
      ? ["オモコロチャンネル", "ふっくらすずめクラブ"]
      : []),
    ...(isNotRadio === "true" ? ["限定ラジオ", "ラジオ"] : []),
  ];
  const count = await prismaClient.article.count({
    where: {
      AND: [
        ...[
          {
            category: {
              isOnigiri: isNotOnigiri === "true" ? false : undefined,
            },
          },
        ],
        ...[
          {
            category: {
              name: category || undefined,
            },
          },
        ],
        ...[
          {
            category: {
              name:
                excludeCategories.length > 0
                  ? { notIn: excludeCategories }
                  : undefined,
            },
          },
        ],
        ...(keyword || "").split(" ").map((v) => ({
          title: {
            contains: v,
            mode: "insensitive" as const,
          },
        })),
        ...[
          {
            writers: {
              some: {
                name: writer || undefined,
              },
            },
          },
        ],
      ],
    },
  });

  return NextResponse.json(count);
}
