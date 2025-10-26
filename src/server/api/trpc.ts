import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { type Context } from './context';

/**
 * 2. INITIALIZATION
 * Initialize tRPC with your context. 
 */
export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Error handling for Zod validation failures
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

/**
 * 3. EXPORT HELPERS
 * Create reusable helpers for defining your routers and procedures.
 */
// Base router and public procedure
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;