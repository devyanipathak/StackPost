// import { createTRPCRouter, publicProcedure } from "../trpc";
// import { z } from "zod";
// import { categories } from "@/src/db/schema";
// import { eq } from "drizzle-orm";

// /**
//  * Router for all Category CRUD operations.
//  */
// export const categoryRouter = createTRPCRouter({
//   // 1. READ (Get all categories)
//   getAll: publicProcedure.query(async ({ ctx }) => {
//     // Fetches all categories
//     return ctx.db.select().from(categories);
//   }),

//   // 2. CREATE (Create a new category)
//   create: publicProcedure
//     .input(
//       z.object({
//         name: z.string().min(1, "Category name is required."),
//         description: z.string().optional(),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       // Inserts the new category
//       const [newCategory] = await ctx.db
//         .insert(categories)
//         .values({
//           name: input.name,
//           description: input.description,
//           // Basic slug generation
//           slug: input.name
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, "-")
//             .replace(/^-*|-*$/g, ""),
//         })
//         .returning();

//       return newCategory;
//     }),

//   // 3. UPDATE (Update an existing category)
//   update: publicProcedure
//     .input(
//       z.object({
//         id: z.number(),
//         name: z.string().min(1, "Category name is required.").optional(),
//         description: z.string().optional(),
//       })
//     )
//     .mutation(async ({ ctx, input }) => {
//       const updatedFields: {
//         name?: string;
//         description?: string;
//         slug?: string;
//       } = {};

//       if (input.name) {
//         updatedFields.name = input.name;
//         updatedFields.slug = input.name
//           .toLowerCase()
//           .replace(/[^a-z0-9]+/g, "-")
//           .replace(/^-*|-*$/g, "");
//       }
//       if (input.description !== undefined) {
//         updatedFields.description = input.description;
//       }

//       const [updatedCategory] = await ctx.db
//         .update(categories)
//         .set(updatedFields)
//         .where(eq(categories.id, input.id))
//         .returning();

//       return updatedCategory;
//     }),

//   // 4. DELETE (Delete a category by ID)
//   delete: publicProcedure
//     .input(z.object({ id: z.number() }))
//     .mutation(async ({ ctx, input }) => {
//       const [deletedCategory] = await ctx.db
//         .delete(categories)
//         .where(eq(categories.id, input.id))
//         .returning({ id: categories.id });

//       return deletedCategory;
//     }),
// });

import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { categories, postsToCategories } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * Router for all Category CRUD operations.
 */
export const categoryRouter = createTRPCRouter({
  // 1. READ (Get all categories)
  getAll: publicProcedure.query(async ({ ctx }) => {
    // more deterministic ordering in UI
    return ctx.db.query.categories.findMany({
      orderBy: (c, { asc }) => [asc(c.id)],
    });
  }),

  // 2. CREATE (Create a new category)
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "Category name is required."),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const baseSlug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const [newCategory] = await ctx.db
        .insert(categories)
        .values({
          name: input.name,
          description: input.description ?? "",
          slug: baseSlug,
        })
        .returning();

      return newCategory;
    }),

  // 3. UPDATE (Update an existing category)
  update: publicProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1, "Category name is required.").optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedFields: {
        name?: string;
        description?: string;
        slug?: string;
      } = {};

      if (input.name !== undefined) {
        updatedFields.name = input.name;
        updatedFields.slug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      if (input.description !== undefined) {
        updatedFields.description = input.description ?? "";
      }

      const [updatedCategory] = await ctx.db
        .update(categories)
        .set(updatedFields)
        .where(eq(categories.id, input.id))
        .returning();

      if (!updatedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found.",
        });
      }

      return updatedCategory;
    }),

  // 4. DELETE (Delete a category by ID)
  delete: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      // IMPORTANT:
      // first remove all post↔category links for this category
      await ctx.db
        .delete(postsToCategories)
        .where(eq(postsToCategories.categoryId, input.id));

      // then remove the category itself
      const [deletedCategory] = await ctx.db
        .delete(categories)
        .where(eq(categories.id, input.id))
        .returning({ id: categories.id });

      if (!deletedCategory) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found.",
        });
      }

      return deletedCategory;
    }),
});
