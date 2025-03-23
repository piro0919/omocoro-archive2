import { cookies } from "next/headers";
import { type JSX } from "react";
import Mypage from "./_components/Mypage";

export const dynamic = "force-dynamic";

export default async function Page(): Promise<JSX.Element> {
  const cookieStore = await cookies();
  const isNotMovie = cookieStore.get("is-not-movie");
  const isNotOnigiri = cookieStore.get("is-not-onigiri");
  const isNotRadio = cookieStore.get("is-not-radio");

  return (
    <Mypage
      isNotMovie={isNotMovie?.value === "true"}
      isNotOnigiri={isNotOnigiri?.value === "true"}
      isNotRadio={isNotRadio?.value === "true"}
    />
  );
}
