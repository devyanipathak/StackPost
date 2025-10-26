import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Categories Table [cite: 70]
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description"), // <-- ADD THIS LINE
});

// Posts Table [cite: 69]
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  // "Draft vs Published" is a Priority 2 feature [cite: 114]
  published: boolean("published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Many-to-Many join table
export const postsToCategories = pgTable(
  "posts_to_categories",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.postId, t.categoryId] }),
  })
);

// --- RELATIONS ---

// A post can have many categories
export const postsRelations = relations(posts, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

// A category can have many posts
export const categoriesRelations = relations(categories, ({ many }) => ({
  postsToCategories: many(postsToCategories),
}));

// The join table relations
export const postsToCategoriesRelations = relations(
  postsToCategories,
  ({ one }) => ({
    category: one(categories, {
      fields: [postsToCategories.categoryId],
      references: [categories.id],
    }),
    post: one(posts, {
      fields: [postsToCategories.postId],
      references: [posts.id],
    }),
  })
);
