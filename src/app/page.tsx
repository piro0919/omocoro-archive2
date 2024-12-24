import prismaClient from "@/lib/prismaClient";
import App from "./_components/App";

export default async function Page(): Promise<React.JSX.Element> {
  const hoge = await prismaClient.category.findMany();

  console.log(hoge);

  return <App />;
}
