# 📰 Full-Stack Blog Platform

**Live on Vercel →**  
**Public Blog:** https://blog-app-nsg8-gnjvyygwd-devyanis-projects-5ccb0326.vercel.app  
**Admin Dashboard:** https://blog-app-nsg8-gnjvyygwd-devyanis-projects-5ccb0326.vercel.app/dashboard  

A minimal CMS-style blog platform with posts, categories, filtering, and an admin dashboard — built with modern full-stack TypeScript (Next.js + tRPC + Drizzle + Postgres + shadcn/ui). Deployed on Vercel.

> TL;DR: You can create posts, edit them, delete them, categorize them, browse them, filter them, and read them. All in a clean responsive UI.

---

## 🔍 Features

This is not “just a blog page.”  
This is a working content system with:

- ✅ Post CRUD (Create / Read / Update / Delete)
- ✅ Category CRUD
- ✅ Assign one or more categories to a post
- ✅ Public blog listing page
- ✅ Individual post page via slug (`/post/[slug]`)
- ✅ Filter posts by category
- ✅ Admin dashboard to manage everything
- ✅ Responsive UI with dialogs, tabs, cards, badges
- ✅ Production deployment on Vercel

In other words: basic publishing workflow, end to end.

---

## 🧠 Data Model

### `posts`
- `id`
- `title`
- `slug` (used in URL, unique)
- `content` (Markdown)
- `published` (boolean)
- timestamps

### `categories`
- `id`
- `name`
- `description`

### `postsToCategories`
- `postId`
- `categoryId`

This is a classic many-to-many:
- A post can have multiple categories.
- A category can be reused across multiple posts.
- We use `postsToCategories` as the join table.

This mapping is fully manageable from the dashboard.

---

## 🏗 Tech Stack

### Frontend
- **Next.js 15 (App Router)**
- **React Server + Client Components**
- **Tailwind CSS**
- **shadcn/ui** (Dialog, Tabs, Card, Badge, Button, etc.)
- **lucide-react** (icons)

### Backend / API
- **tRPC** for typesafe, zero-REST boilerplate communication
- **zod** for runtime validation
- **TRPCError** for clean error handling

### Database
- **PostgreSQL**
- **Drizzle ORM** for schema + queries
- Join table for post ↔ category

### Infra
- **Vercel** for deployment
- Branch-based deploy: `main` is live
- Connection string provided via env var

---

## 🖥 Admin Dashboard

The dashboard is a mini CMS with three tabs:

- **Create Post**
- **Posts**
- **Categories**

### 1. Create Post tab
You can:
- Enter Title
- Write Markdown content
- Auto-generate a URL slug from the title
- Pick one or more categories using clickable badges
- Publish

On submit:
- We run the `post.create` mutation
- Insert the post into `posts`
- Insert the category relationships into `postsToCategories`
- Redirect to `/post/[slug]`

### 2. Posts tab
You get a grid of all posts. Each card shows:
- Title
- Slug (so you know the URL)
- Category badges
- Small content preview

Each post card has two actions:
- **Edit** → opens an edit dialog
- **Delete** → opens a confirm dialog

Editing a post:
- You can change title, slug, content, and categories
- Categories are toggled like chips
- Hitting Save calls `post.update`, which:
  - Updates the `posts` table
  - Clears old rows in `postsToCategories`
  - Inserts new mappings

Deleting a post:
- Confirms first (safety)
- Calls `post.delete`
- Removes join table rows too
- We invalidate cached queries so the UI refreshes immediately

### 3. Categories tab
You see all categories as cards with:
- Name
- Description
- Edit / Delete actions

You can:
- Create a new category (name + optional description)
- Edit an existing category
- Delete a category

This is how you control the taxonomy of the blog.

> Note: there's intentionally no auth layer here yet. This dashboard is meant to demonstrate CRUD and relational integrity, not production RBAC.

---

## 🌐 Public-Facing Pages

### All Posts Page
- Shows published posts
- Includes their metadata and categories
- Can be filtered by category

### Single Post Page
- URL: `/post/[slug]`
- We use `postRouter.getBySlug` to fetch the post + categories
- Renders Markdown content

### Category Filter
We expose a query (`listByCategoryId`) that:
- Looks up post IDs through the join table
- De-dupes results
- Sorts them newest-first
- Returns posts for just that category

This covers “browse by topic/section”.

---

## 📦 API / tRPC Routers

### `postRouter`
```ts
getAll              // list all posts (with their categories)
listByCategoryId    // list posts filtered by category
getAllForDashboard  // posts + categories for the admin dashboard
getBySlug           // fetch a single post by slug (for /post/[slug])
create              // create a post and attach categories
update              // update a post and replace its category mappings
delete              // delete a post and clean up join rows
