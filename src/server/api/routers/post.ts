// import { createTRPCRouter, publicProcedure } from "../trpc";
// import { TRPCError } from "@trpc/server";
// import { z } from "zod";
// import { posts, postsToCategories } from "@/src/db/schema";

// export const postRouter = createTRPCRouter({
//   // Get all posts for homepage
//   getAll: publicProcedure.query(async ({ ctx }) => {
//     return ctx.db.query.posts.findMany({
//       with: {
//         postsToCategories: {
//           with: {
//             category: true,
//           },
//         },
//       },
//       orderBy: (posts, { desc }) => [desc(posts.createdAt)],
//     });
//   }),

//   // Get one post by slug for /post/[slug]
//   getBySlug: publicProcedure
//     .input(
//       z.object({
//         slug: z.string().min(1),
//       })
//     )
//     .query(async ({ ctx, input }) => {
//       const [post] = await ctx.db.query.posts.findMany({
//         where: (p, { eq }) => eq(p.slug, input.slug),
//         with: {
//           postsToCategories: {
//             with: {
//               category: true,
//             },
//           },
//         },
//         limit: 1,
//       });

//       return post ?? null;
//     }),

//   // Create a new post
//   create: publicProcedure
//     .input(
//       z.object({
//         title: z.string().min(1),
//         content: z.string().optional(),
//         slug: z.string().min(1),
//         categoryIds: z.array(z.number().int()).min(1),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       try {
//         // 1. insert the post row
//         const [newPost] = await ctx.db
//           .insert(posts)
//           .values({
//             title: input.title,
//             content: input.content ?? "",
//             slug: input.slug,
//             published: true,
//           })
//           .returning();

//         // 2. insert join rows
//         const rowsToInsert = input.categoryIds.map((catId) => ({
//           postId: newPost.id,
//           categoryId: catId,
//         }));

//         if (rowsToInsert.length > 0) {
//           await ctx.db.insert(postsToCategories).values(rowsToInsert);
//         }

//         // 3. return the post so the client can redirect with newPost.slug
//         return newPost;
//       } catch (err: any) {
//         // Drizzle wraps PG errors. The real PG code sits in err.cause?.code.
//         const pgCode = err?.code ?? err?.cause?.code;

//         if (pgCode === "23505") {
//           // Unique violation (slug already exists)
//           throw new TRPCError({
//             code: "CONFLICT",
//             message:
//               "A post with this slug already exists. Pick a different title.",
//           });
//         }

//         console.error("post.create failed:", err);

//         throw new TRPCError({
//           code: "INTERNAL_SERVER_ERROR",
//           message: "Failed to create post.",
//         });
//       }
//     }),
// });

import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { posts, postsToCategories } from "@/src/db/schema";
import { eq } from "drizzle-orm";

export const postRouter = createTRPCRouter({
  // PUBLIC HOMEPAGE LIST (unfiltered)
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }),

  // PUBLIC HOMEPAGE LIST (optionally filtered by category)
  listByCategoryId: publicProcedure
    .input(
      z.object({
        categoryId: z.number().int().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // no filter? act like getAll
      if (!input.categoryId) {
        return ctx.db.query.posts.findMany({
          with: {
            postsToCategories: {
              with: {
                category: true,
              },
            },
          },
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        });
      }

      // filter by category via join table
      const rows = await ctx.db.query.postsToCategories.findMany({
        where: (ptc, { eq }) => eq(ptc.categoryId, input.categoryId!),
        with: {
          post: {
            with: {
              postsToCategories: {
                with: {
                  category: true,
                },
              },
            },
          },
        },
      });

      // dedupe posts because a post could theoretically show up multiple times
      const dedup = new Map<number, (typeof rows)[number]["post"]>();
      for (const r of rows) {
        dedup.set(r.post.id, r.post);
      }

      // sort newest first (by createdAt desc)
      return Array.from(dedup.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }),

  // DASHBOARD LIST (for admin UI)
  getAllForDashboard: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.query.posts.findMany({
      with: {
        postsToCategories: {
          with: {
            category: true,
          },
        },
      },
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });
  }),

  // GET ONE POST BY SLUG (used on /post/[slug])
  getBySlug: publicProcedure
    .input(
      z.object({
        slug: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      const [post] = await ctx.db.query.posts.findMany({
        where: (p, { eq }) => eq(p.slug, input.slug),
        with: {
          postsToCategories: {
            with: {
              category: true,
            },
          },
        },
        limit: 1,
      });

      return post ?? null;
    }),

  // CREATE POST
  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().optional(),
        slug: z.string().min(1),
        categoryIds: z.array(z.number().int()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. insert into posts
        const [newPost] = await ctx.db
          .insert(posts)
          .values({
            title: input.title,
            content: input.content ?? "",
            slug: input.slug,
            published: true, // for now every post is "published"
          })
          .returning();

        // 2. link categories
        const rowsToInsert = input.categoryIds.map((catId) => ({
          postId: newPost.id,
          categoryId: catId,
        }));

        if (rowsToInsert.length > 0) {
          await ctx.db.insert(postsToCategories).values(rowsToInsert);
        }

        // 3. return post (used to redirect client to /post/[slug])
        return newPost;
      } catch (err: any) {
        // if slug is duplicate (postgres unique violation)
        if (err?.code === "23505") {
          throw new TRPCError({
            code: "CONFLICT",
            message:
              "A post with this slug already exists. Pick a different title.",
          });
        }

        console.error("post.create failed:", err);

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create post.",
        });
      }
    }),

  // UPDATE POST
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1).optional(),
        content: z.string().optional(),
        slug: z.string().min(1).optional(),
        categoryIds: z.array(z.number().int()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // gather updates
      const updateData: {
        title?: string;
        content?: string;
        slug?: string;
      } = {};

      if (input.title !== undefined) updateData.title = input.title;
      if (input.content !== undefined) updateData.content = input.content;
      if (input.slug !== undefined) updateData.slug = input.slug;

      // update post row
      const [updatedPost] = await ctx.db
        .update(posts)
        .set(updateData)
        .where(eq(posts.id, input.id))
        .returning();

      if (!updatedPost) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found.",
        });
      }

      // if categoryIds provided, replace relations
      if (input.categoryIds) {
        // remove all old category links
        await ctx.db
          .delete(postsToCategories)
          .where(eq(postsToCategories.postId, input.id));

        // add new links
        if (input.categoryIds.length > 0) {
          const rowsToInsert = input.categoryIds.map((catId) => ({
            postId: input.id,
            categoryId: catId,
          }));
          await ctx.db.insert(postsToCategories).values(rowsToInsert);
        }
      }

      return updatedPost;
    }),

  // DELETE POST
  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // clean up join rows first
      await ctx.db
        .delete(postsToCategories)
        .where(eq(postsToCategories.postId, input.id));

      // then delete the post
      const [deleted] = await ctx.db
        .delete(posts)
        .where(eq(posts.id, input.id))
        .returning({ id: posts.id });

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found.",
        });
      }

      return deleted;
    }),
});
