import Link from "next/link";
import { api } from "@/src/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PostCard from "@/components/ui/PostCard";

export const dynamic = "force-dynamic";

// Next.js dev preview (16.x / Turbopack) sometimes gives searchParams as a Promise.
// We'll keep your await logic but wrap it defensively.
type HomeProps = {
  searchParams?: Promise<{
    categoryId?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  // unwrap the promise (works in both canary + stable)
  const sp = searchParams ? await searchParams : {};

  // read categoryId from query string
  const rawCategoryId = sp?.categoryId;

  // convert to number, but don't pass NaN down
  const categoryIdNum =
    rawCategoryId !== undefined && rawCategoryId !== ""
      ? Number(rawCategoryId)
      : undefined;

  const finalCategoryId =
    typeof categoryIdNum === "number" && !Number.isNaN(categoryIdNum)
      ? categoryIdNum
      : undefined;

  // fetch categories for the filter chips
  const categories = await api.category.getAll();

  // fetch posts, filtered if category chip is active
  const posts = await api.post.listByCategoryId({
    categoryId: finalCategoryId,
  });

  return (
    <main className="container mx-auto max-w-3xl p-4 md:p-8 space-y-10">
      {/* HEADER / FILTERS */}
      <header className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            All Blog Posts
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            Browse posts and filter by category. Click a post to read more.
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {/* "All" chip */}
          <Link
            href="/"
            className={[
              "rounded-full border px-3 py-1 text-sm transition",
              "select-none cursor-pointer",
              "flex items-center gap-1",
              finalCategoryId === undefined
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700",
            ].join(" ")}
          >
            <span className="font-medium">All</span>
          </Link>

          {categories.map((cat) => {
            const active = finalCategoryId === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/?categoryId=${cat.id}`}
                className={[
                  "rounded-full border px-3 py-1 text-sm transition",
                  "select-none cursor-pointer",
                  "flex items-center gap-1",
                  active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm"
                    : "bg-white text-slate-700 hover:bg-slate-50 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700",
                ].join(" ")}
              >
                <span className="font-medium">{cat.name}</span>

                {active && (
                  <span className="h-2 w-2 rounded-full bg-green-500 ring-2 ring-green-500/20" />
                )}
              </Link>
            );
          })}
        </div>

        {/* DASHBOARD LINK / ACTION BAR */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-3">
          {/* DASHBOARD LINK / ACTION BAR */}
          <div className="flex flex-row flex-wrap items-center justify-between gap-3">
            <Link
              href="/dashboard"
              className={[
                "group relative inline-flex items-center gap-2",
                "rounded-lg px-3 py-2 text-xs font-medium",
                "bg-gradient-to-r from-blue-600 to-blue-500 text-white",
                "shadow-sm ring-1 ring-inset ring-blue-500/40",
                "transition-all",
                "hover:from-blue-500 hover:to-blue-400 hover:shadow-md hover:ring-blue-400/60",
                "active:scale-[0.98]",
                "dark:from-blue-500 dark:to-blue-400 dark:text-slate-900 dark:ring-blue-400/40",
              ].join(" ")}
            >
              <span className="whitespace-nowrap">Go to Admin Dashboard</span>

              {/* arrow icon that slides when hovered */}
              <span
                aria-hidden="true"
                className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>

              {/* subtle focus ring outline for keyboard users */}
              <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-transparent group-focus-visible:ring-white/60 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-blue-600 dark:group-focus-visible:ring-offset-slate-900"></span>
            </Link>
          </div>


          {/* little status badge / count */}
          <div className="text-[11px] leading-none rounded-full bg-slate-100 text-slate-600 px-2 py-1 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {posts.length} post{posts.length === 1 ? "" : "s"} found
          </div>
        </div>
      </header>

      {/* POSTS LIST */}
      <section className="grid grid-cols-1 gap-6">
        {posts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-8 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No posts found for this filter. Try another category.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              href={`/post/${post.slug}`}
              title={post.title}
              preview={post.content?.substring(0, 150) ?? ""}
              categories={
                post.postsToCategories?.map(({ category }) => category.name) ??
                []
              }
            />
          ))
        )}
      </section>
    </main>
  );
}
