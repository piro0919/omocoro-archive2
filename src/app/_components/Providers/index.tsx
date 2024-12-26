"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type JSX, type PropsWithChildren } from "react";

const queryClient = new QueryClient();

export default function Providers({
  children,
}: PropsWithChildren): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
