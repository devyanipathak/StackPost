import { db } from "@/src/db";

export const createTRPCContext = ({ req }: { req: Request }) => {
  return {
    db,
    req,
  };
};

export type Context = ReturnType<typeof createTRPCContext>;
