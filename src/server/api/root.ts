import { createTRPCRouter, t } from "./trpc";
import { postRouter } from "./routers/post";
import { categoryRouter } from "./routers/category";

export const appRouter = createTRPCRouter({
  post: postRouter,
  category: categoryRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = t.createCallerFactory(appRouter);
