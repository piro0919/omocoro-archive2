import prismaClient from "@/lib/prismaClient";
import { type JSX } from "react";
import Writer from "./_components/Writer";

// 12 時間
export const revalidate = 43200;

export default async function Page(): Promise<JSX.Element> {
  const writers = await prismaClient.writer.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return <Writer writers={writers} />;
}
