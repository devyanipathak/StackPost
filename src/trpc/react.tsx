"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCReact } from "@trpc/react-query";
import { loggerLink, httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import type { AppRouter } from "@/src/server/api/root";

// This is the tRPC hook interface you use everywhere in client land:
// api.post.getAll.useQuery(), api.category.create.useMutation(), etc.
export const api = createTRPCReact<AppRouter>();

// Singleton QueryClient for the browser, fresh per request on server
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server render (like RSC children mounting inside client) → always new
    return new QueryClient();
  }
  // Browser → reuse a single instance
  if (!browserQueryClient) {
    browserQueryClient = new QueryClient();
  }
  return browserQueryClient;
}

// Resolve base URL for the API route.
// IMPORTANT: you are actually running on port 3001 in your screenshots.
function getBaseUrl() {
  if (typeof window !== "undefined") return ""; // browser: relative URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3001}`;
}

// The provider component that must wrap any hook usage
export function TRPCReactProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  // We create the tRPC client once and memoize it with useState
  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled(op) {
            return (
              process.env.NODE_ENV === "development" ||
              (op.direction === "down" && op.result instanceof Error)
            );
          },
        }),

        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,

          // CRITICAL: this must match transformer on the server initTRPC
          transformer: superjson,

          // Optional headers — fine to keep
          headers() {
            return {
              "x-trpc-source": "nextjs-react",
            };
          },
        }),
      ],
    })
  );

  // Provider order: <api.Provider><QueryClientProvider>{children}</QueryClientProvider></api.Provider>
  return (
    <api.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </api.Provider>
  );
}
