import { createTRPCRouter } from '../trpc';
import { postRouter } from './post';
import { categoryRouter } from './category';

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