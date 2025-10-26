import "server-only";
import { createCaller } from "@/src/server/api/root";
import { db } from "@/src/db";

// Context for server components (RSC calls)
const createRSCContext = () => {
  return {
    db,
  };
};

export const api = createCaller(createRSCContext);
