import { createTRPCRouter, t } from "./trpc"; // <-- ADD ', t' HERE
import { postRouter } from "./routers/post";
import { categoryRouter } from "./routers/category";

/**
 * This is the primary router for your server.
 * It combines all of the application's routers into a single API endpoint.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  category: categoryRouter,
});

// Export only the type definition of the router
export type AppRouter = typeof appRouter;

// --- ADD THESE 3 LINES AT THE BOTTOM ---
/**
 * Create a server-side caller for the tRPC API.
 */
export const createCaller = t.createCallerFactory(appRouter);
