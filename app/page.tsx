// import Link from "next/link";
// import { api } from "@/src/trpc/server";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";

// export const dynamic = "force-dynamic";

// interface HomeProps {
//   searchParams?: {
//     categoryId?: string;
//   };
// }

// export default async function Home({ searchParams }: HomeProps) {
//   // read ?categoryId= from URL
//   const categoryIdNum = searchParams?.categoryId
//     ? Number(searchParams.categoryId)
//     : undefined;

//   // fetch categories for filter UI
//   const categories = await api.category.getAll();

//   // fetch posts (filtered if categoryId is provided)
//   const posts = await api.post.listByCategoryId({
//     categoryId: categoryIdNum,
//   });

//   return (
//     <main className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8">
//       {/* HEADER / FILTERS */}
//       <header className="space-y-3">
//         <h1 className="text-4xl font-bold tracking-tight">All Blog Posts</h1>

//         <p className="text-sm text-muted-foreground">
//           Browse posts and filter by category.
//         </p>

//         <div className="flex flex-wrap gap-2">
//           {/* "All" chip */}
//           <Link
//             href="/"
//             className={`rounded-full border px-3 py-1 text-sm transition ${
//               categoryIdNum === undefined
//                 ? "bg-slate-900 text-white"
//                 : "hover:bg-slate-100"
//             }`}
//           >
//             All
//           </Link>

//           {categories.map((cat) => (
//             <Link
//               key={cat.id}
//               href={`/?categoryId=${cat.id}`}
//               className={`rounded-full border px-3 py-1 text-sm transition ${
//                 categoryIdNum === cat.id
//                   ? "bg-slate-900 text-white"
//                   : "hover:bg-slate-100"
//               }`}
//             >
//               {cat.name}
//             </Link>
//           ))}
//         </div>
//       </header>

//       {/* DASHBOARD LINK */}
//       <div>
//         <Link
//           href="/dashboard"
//           className="text-blue-500 text-sm hover:underline"
//         >
//           → Go to Admin Dashboard
//         </Link>
//       </div>

//       {/* POSTS LIST */}
//       <section className="grid grid-cols-1 gap-6">
//         {posts.length === 0 && (
//           <p className="text-muted-foreground">
//             No posts found for this filter. Try another category.
//           </p>
//         )}

//         {posts.map((post) => (
//           <Link href={`/post/${post.slug}`} key={post.id}>
//             <Card className="cursor-pointer transition-shadow hover:shadow-lg">
//               <CardHeader>
//                 <CardTitle className="text-xl font-semibold">
//                   {post.title}
//                 </CardTitle>

//                 <CardDescription className="line-clamp-2 text-sm leading-relaxed">
//                   {post.content?.substring(0, 150)}...
//                 </CardDescription>
//               </CardHeader>

//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {post.postsToCategories?.map(({ category }) => (
//                     <Badge
//                       key={category.id}
//                       variant="secondary"
//                       className="text-xs"
//                     >
//                       {category.name}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>
//         ))}
//       </section>
//     </main>
//   );
// }
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

export const dynamic = "force-dynamic";

// Next.js (App Router / RSC) now gives searchParams as a Promise in dev.
// So we type it that way and then await it.
type HomeProps = {
  searchParams: Promise<{
    categoryId?: string;
  }>;
};

export default async function Home({ searchParams }: HomeProps) {
  // unwrap the promise
  const sp = await searchParams;

  // pull categoryId from query string
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
    <main className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8">
      {/* HEADER / FILTERS */}
      <header className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">All Blog Posts</h1>

        <p className="text-sm text-muted-foreground">
          Browse posts and filter by category.
        </p>

        {/* category pills */}
        <div className="flex flex-wrap gap-2">
          {/* "All" chip */}
          <Link
            href="/"
            className={`rounded-full border px-3 py-1 text-sm transition ${
              finalCategoryId === undefined
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-100"
            }`}
          >
            All
          </Link>

          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/?categoryId=${cat.id}`}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                finalCategoryId === cat.id
                  ? "bg-slate-900 text-white"
                  : "hover:bg-slate-100"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </header>

      {/* DASHBOARD LINK */}
      <div>
        <Link
          href="/dashboard"
          className="text-blue-500 text-sm hover:underline"
        >
          → Go to Admin Dashboard
        </Link>
      </div>

      {/* POSTS LIST */}
      <section className="grid grid-cols-1 gap-6">
        {posts.length === 0 && (
          <p className="text-muted-foreground">
            No posts found for this filter. Try another category.
          </p>
        )}

        {posts.map((post) => (
          <Link href={`/post/${post.slug}`} key={post.id}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  {post.title}
                </CardTitle>

                <CardDescription className="line-clamp-2 text-sm leading-relaxed">
                  {post.content?.substring(0, 150)}...
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.postsToCategories?.map(({ category }) => (
                    <Badge
                      key={category.id}
                      variant="secondary"
                      className="text-xs"
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
