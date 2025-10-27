import "server-only";
import { createCaller } from "@/src/server/api/root";
import { db } from "@/src/db";

// Context for server components (RSC calls)
const createRSCContext = () => {
  return {
    db,
    // minimal Request object just to satisfy the type
    req: new Request("http://internal.local"),
  };
};

export const api = createCaller(createRSCContext);