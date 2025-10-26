import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/src/server/api/root";
import { createTRPCContext } from "@/src/server/api/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    // pass req so ctx.db etc are per-request if you ever need headers/cookies
    createContext() {
      return createTRPCContext({ req });
    },
  });

export { handler as GET, handler as POST };
