import { cookies } from "next/headers";
import { type JSX } from "react";
import Mypage from "./_components/Mypage";

export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const isNotOnigiri = cookieStore.get("is-not-onigiri");

  return <Mypage isNotOnigiri={isNotOnigiri?.value === "true"} />;
}
