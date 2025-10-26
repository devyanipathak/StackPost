import { api } from "@/src/trpc/server";

interface PostPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

async function resolveParams(
  params: PostPageProps["params"]
): Promise<{ slug: string }> {
  if (typeof (params as any)?.then === "function") {
    return await (params as Promise<{ slug: string }>);
  }
  return params as { slug: string };
}

export default async function PostPage(rawProps: PostPageProps) {
  const { slug } = await resolveParams(rawProps.params);
  const post = await api.post.getBySlug({ slug });

  if (!post) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 py-16 text-slate-900">
        <div className="mx-auto max-w-2xl px-4">
          <div className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-10 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">
              Post not found
            </h1>
            <p className="mt-2 text-slate-500">
              That post doesn’t exist anymore.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 py-16 text-slate-900">
      <article className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 md:text-4xl">
            {post.title}
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>

          {/* Categories */}
          {post.postsToCategories && post.postsToCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.postsToCategories.map((rel) => (
                <span
                  key={rel.category.id}
                  className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {rel.category.name}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Body */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-200/50">
          <div className="prose max-w-none whitespace-pre-wrap leading-relaxed text-slate-800 prose-p:my-4 prose-headings:mt-6 prose-headings:mb-2 prose-headings:font-semibold">
            {post.content}
          </div>
        </section>
      </article>
    </main>
  );
}
