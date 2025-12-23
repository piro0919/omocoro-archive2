import prismaClient from "@/lib/prisma-client";
import { type Writer } from "@prisma/client";
import WriterComponent from "./_components/Writer";

// 12 時間
export const revalidate = 43200;

const getWriters = async (): Promise<Writer[]> => {
  const writers = await prismaClient.writer.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return writers;
};

export default async function Page(): Promise<React.JSX.Element> {
  const writers = await getWriters();

  return <WriterComponent writers={writers} />;
}
