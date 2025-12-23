import { Suspense } from "react";
import App from "./_components/App";

// 12 時間
export const revalidate = 43200;

export default async function Page(): Promise<React.JSX.Element> {
  return (
    <Suspense>
      <App />
    </Suspense>
  );
}
