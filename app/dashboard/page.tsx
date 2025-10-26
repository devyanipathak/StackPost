// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// import { TRPCReactProvider, api } from "@/src/trpc/react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// const slugify = (str: string) =>
//   str
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s-]/g, "")
//     .replace(/[\s_-]+/g, "-")
//     .replace(/^-+|-+$/g, "");

// function DashboardInner() {
//   const router = useRouter();
//   const utils = api.useUtils();

//   const { data: categories } = api.category.getAll.useQuery();
//   const { data: postsForDashboard } = api.post.getAllForDashboard.useQuery();

//   // Category form state
//   const [categoryName, setCategoryName] = useState("");
//   const [categoryDesc, setCategoryDesc] = useState("");

//   const createCategory = api.category.create.useMutation({
//     onSuccess: async () => {
//       await utils.category.getAll.invalidate();
//       setCategoryName("");
//       setCategoryDesc("");
//     },
//     onError: (err) => {
//       alert(`Failed to create category: ${err.message}`);
//     },
//   });

//   // Post form state
//   const [postTitle, setPostTitle] = useState("");
//   const [postContent, setPostContent] = useState("");
//   const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

//   const createPost = api.post.create.useMutation({
//     onSuccess: (newPost) => {
//       router.push(`/post/${newPost.slug}`);
//     },
//     onError: (err) => {
//       alert(`Error creating post: ${err.message}`);
//     },
//   });
//   const deletePost = api.post.delete.useMutation({
//     onSuccess: async () => {
//       await utils.post.getAllForDashboard.invalidate();
//     },
//     onError: (err) => {
//       alert(`Failed to delete post: ${err.message}`);
//     },
//   });

//   // handlers
//   const handleCreateCategory = () => {
//     if (!categoryName) {
//       alert("Please enter a category name.");
//       return;
//     }
//     createCategory.mutate({
//       name: categoryName,
//       description: categoryDesc,
//     });
//   };

//   const handleCreatePost = () => {
//     if (!postTitle || selectedCategories.length === 0) {
//       alert("Please add a title and select at least one category.");
//       return;
//     }
//     createPost.mutate({
//       title: postTitle,
//       content: postContent,
//       slug: slugify(postTitle),
//       categoryIds: selectedCategories,
//     });
//   };

//   return (
//     <main className="min-h-screen bg-gradient-to-b from-white via-white to-slate-50 py-10 text-slate-900">
//       <div className="container mx-auto max-w-6xl px-4 md:px-8">
//         {/* Page header */}
//         <header className="mb-10">
//           <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
//             Admin Dashboard
//           </h1>
//           <p className="mt-2 max-w-2xl text-slate-600">
//             Create categories and publish new posts. Changes are live
//             immediately.
//           </p>
//         </header>

//         <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
//           {/* LEFT: Category Management */}
//           <Card className="rounded-xl border border-slate-200 bg-white/90 shadow-sm ring-1 ring-slate-200/50">
//             <CardHeader className="border-b border-slate-100 pb-4">
//               <CardTitle className="text-lg font-semibold text-slate-900">
//                 Create New Category
//               </CardTitle>
//               <p className="text-sm text-slate-500">
//                 Organize posts by topic. These show up as tags.
//               </p>
//             </CardHeader>

//             <CardContent className="space-y-6 pt-6">
//               {/* Category Name */}
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="cat-name"
//                   className="text-sm font-medium text-slate-700"
//                 >
//                   Category Name
//                 </Label>
//                 <Input
//                   id="cat-name"
//                   value={categoryName}
//                   onChange={(e) => setCategoryName(e.target.value)}
//                   placeholder="e.g. Backend, Career, DevOps, etc."
//                   className="rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
//                 />
//               </div>

//               {/* Category Description */}
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="cat-desc"
//                   className="text-sm font-medium text-slate-700"
//                 >
//                   Description
//                 </Label>
//                 <Textarea
//                   id="cat-desc"
//                   value={categoryDesc}
//                   onChange={(e) => setCategoryDesc(e.target.value)}
//                   placeholder="Short sentence about this category..."
//                   className="min-h-[80px] rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
//                 />
//               </div>

//               {/* Submit Category */}
//               <Button
//                 onClick={handleCreateCategory}
//                 disabled={createCategory.isPending}
//                 className="w-full rounded-lg bg-slate-900 text-white hover:bg-slate-800"
//               >
//                 {createCategory.isPending ? "Creating..." : "Create Category"}
//               </Button>

//               {/* Existing Categories */}
//               <div className="pt-4">
//                 <h4 className="text-sm font-semibold text-slate-800">
//                   Existing Categories
//                 </h4>

//                 <div className="mt-3 flex flex-wrap gap-2">
//                   {Array.isArray(categories) && categories.length > 0 ? (
//                     categories.map((cat) => (
//                       <span
//                         key={cat.id}
//                         className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
//                       >
//                         {cat.name}
//                       </span>
//                     ))
//                   ) : Array.isArray(categories) && categories.length === 0 ? (
//                     <p className="text-sm text-slate-500">No categories yet.</p>
//                   ) : (
//                     <p className="text-sm italic text-slate-400">Loading…</p>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* RIGHT: Post Management */}
//           <Card className="rounded-xl border border-slate-200 bg-white/90 shadow-sm ring-1 ring-slate-200/50">
//             <CardHeader className="border-b border-slate-100 pb-4">
//               <CardTitle className="text-lg font-semibold text-slate-900">
//                 Create New Post
//               </CardTitle>
//               <p className="text-sm text-slate-500">
//                 Write something, pick categories, publish instantly.
//               </p>
//             </CardHeader>

//             <CardContent className="space-y-6 pt-6">
//               {/* Post Title */}
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="post-title"
//                   className="text-sm font-medium text-slate-700"
//                 >
//                   Post Title
//                 </Label>
//                 <Input
//                   id="post-title"
//                   value={postTitle}
//                   onChange={(e) => setPostTitle(e.target.value)}
//                   placeholder="My New Blog Post"
//                   className="rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
//                 />
//               </div>

//               {/* Category Selector */}
//               <div className="space-y-2">
//                 <Label className="text-sm font-medium text-slate-700">
//                   Categories
//                   <span className="ml-1 text-[11px] font-normal text-slate-500">
//                     (multi-select)
//                   </span>
//                 </Label>
//                 <p className="text-xs text-slate-500">Click to add / remove</p>

//                 <div className="flex flex-wrap gap-2 rounded-lg border border-slate-300 bg-white p-3">
//                   {Array.isArray(categories) && categories.length === 0 && (
//                     <p className="text-sm text-slate-500">
//                       Create a category first.
//                     </p>
//                   )}

//                   {Array.isArray(categories) &&
//                     categories.map((cat) => {
//                       const active = selectedCategories.includes(cat.id);
//                       return (
//                         <Button
//                           key={cat.id}
//                           type="button"
//                           size="sm"
//                           variant={active ? "default" : "outline"}
//                           className={
//                             active
//                               ? "rounded-full bg-slate-900 text-white hover:bg-slate-800"
//                               : "rounded-full border-slate-300 text-slate-700 hover:bg-slate-50"
//                           }
//                           onClick={() => {
//                             setSelectedCategories((prev) =>
//                               prev.includes(cat.id)
//                                 ? prev.filter((id) => id !== cat.id)
//                                 : [...prev, cat.id]
//                             );
//                           }}
//                         >
//                           {cat.name}
//                         </Button>
//                       );
//                     })}
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="post-content"
//                   className="text-sm font-medium text-slate-700"
//                 >
//                   Content (Markdown)
//                 </Label>
//                 <Textarea
//                   id="post-content"
//                   value={postContent}
//                   onChange={(e) => setPostContent(e.target.value)}
//                   placeholder="Write your post here... # Hello world"
//                   rows={10}
//                   className="rounded-lg border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
//                 />
//               </div>

//               {/* Publish */}
//               <Button
//                 onClick={handleCreatePost}
//                 disabled={createPost.isPending}
//                 className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:bg-blue-400"
//                 size="lg"
//               >
//                 {createPost.isPending
//                   ? "Publishing..."
//                   : "Create & Publish Post"}
//               </Button>
//             </CardContent>
//           </Card>
//         </section>
//       </div>
//     </main>
//   );
// }

// // wrapper stays the same so trpc hooks work
// export default function DashboardPage() {
//   return (
//     <TRPCReactProvider>
//       <DashboardInner />
//     </TRPCReactProvider>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { TRPCReactProvider, api } from "@/src/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// helper to build slugs from title
const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function DashboardInner() {
  const router = useRouter();

  // react-query utilities (refetch/invalidate)
  const utils = api.useUtils();

  // fetch categories for selecting + admin list
  const { data: categories } = api.category.getAll.useQuery();

  // fetch posts for admin list
  const { data: postsForDashboard } = api.post.getAllForDashboard.useQuery();

  // --- CATEGORY FORM STATE ---
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  // CREATE category
  const createCategory = api.category.create.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
      setCategoryName("");
      setCategoryDesc("");
    },
    onError: (err) => {
      alert(`Failed to create category: ${err.message}`);
    },
  });

  // UPDATE category
  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
    },
    onError: (err) => {
      alert(`Failed to update category: ${err.message}`);
    },
  });

  // DELETE category
  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
    },
    onError: (err) => {
      alert(`Failed to delete category: ${err.message}`);
    },
  });

  // --- POST FORM STATE ---
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // CREATE post
  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      // redirect to new post
      router.push(`/post/${newPost.slug}`);
    },
    onError: (err) => {
      alert(`Error creating post: ${err.message}`);
    },
  });

  // DELETE post
  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.getAllForDashboard.invalidate();
    },
    onError: (err) => {
      alert(`Failed to delete post: ${err.message}`);
    },
  });

  // --- Handlers ---

  const handleCreateCategory = () => {
    if (!categoryName) {
      alert("Please enter a category name.");
      return;
    }
    createCategory.mutate({
      name: categoryName,
      description: categoryDesc,
    });
  };

  const handleEditCategory = (
    catId: number,
    currentName: string,
    currentDesc?: string | null
  ) => {
    const newName = prompt("New category name:", currentName ?? "");
    if (!newName) return;

    const newDesc = prompt("New description:", currentDesc ?? "");

    updateCategory.mutate({
      id: catId,
      name: newName,
      description: newDesc ?? undefined,
    });
  };

  const handleDeleteCategory = (catId: number, catName: string) => {
    if (confirm(`Delete category "${catName}"? This may orphan posts.`)) {
      deleteCategory.mutate({ id: catId });
    }
  };

  const handleCreatePost = () => {
    if (!postTitle || selectedCategories.length === 0) {
      alert("Please add a title and select at least one category.");
      return;
    }

    createPost.mutate({
      title: postTitle,
      content: postContent,
      slug: slugify(postTitle),
      categoryIds: selectedCategories,
    });
  };

  const handleDeletePost = (postId: number, postTitle: string) => {
    if (confirm(`Delete "${postTitle}"? This cannot be undone.`)) {
      deletePost.mutate({ id: postId });
    }
  };

  return (
    <main className="container mx-auto grid max-w-6xl grid-cols-1 gap-12 p-4 md:grid-cols-2 md:p-8">
      {/* LEFT COLUMN: CATEGORY MANAGEMENT */}
      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Create New Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="cat-name">Category Name</Label>
              <Input
                id="cat-name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Software Engineering"
              />
            </div>

            {/* Category Description */}
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                value={categoryDesc}
                onChange={(e) => setCategoryDesc(e.target.value)}
                placeholder="What is this category about?"
              />
            </div>

            {/* Submit Category */}
            <Button
              onClick={handleCreateCategory}
              disabled={createCategory.isPending}
              className="w-full md:w-auto"
            >
              {createCategory.isPending ? "Creating..." : "Create Category"}
            </Button>

            {/* Existing Categories */}
            <div className="pt-6 border-t">
              <h4 className="text-lg font-semibold mb-4">
                Existing Categories
              </h4>

              <ul className="space-y-2">
                {!Array.isArray(categories) ? (
                  <li className="text-sm text-muted-foreground italic">
                    Loading…
                  </li>
                ) : categories.length === 0 ? (
                  <li className="text-sm text-muted-foreground">
                    No categories yet.
                  </li>
                ) : (
                  categories.map((cat) => (
                    <li
                      key={cat.id}
                      className="flex flex-col rounded border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{cat.name}</div>
                        {cat.description && (
                          <div className="text-xs text-muted-foreground">
                            {cat.description}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2 md:mt-0">
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={updateCategory.isPending}
                          onClick={() =>
                            handleEditCategory(
                              cat.id,
                              cat.name,
                              cat.description ?? ""
                            )
                          }
                        >
                          {updateCategory.isPending ? "Saving..." : "Edit"}
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleteCategory.isPending}
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        >
                          {deleteCategory.isPending ? "Removing..." : "Delete"}
                        </Button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* RIGHT COLUMN: POST MANAGEMENT */}
      <section>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              Create New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Post Title */}
            <div className="space-y-2">
              <Label htmlFor="post-title">Post Title</Label>
              <Input
                id="post-title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="My New Blog Post"
              />
            </div>

            {/* Category Selector */}
            <div className="space-y-2">
              <Label>Categories (Multi-Select)</Label>
              <p className="text-sm text-muted-foreground">
                Click to add/remove.
              </p>
              <div className="flex flex-wrap gap-2 rounded-md border p-2">
                {Array.isArray(categories) && categories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Create a category first!
                  </p>
                )}

                {Array.isArray(categories) &&
                  categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={
                        selectedCategories.includes(cat.id)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(cat.id)
                            ? prev.filter((id) => id !== cat.id)
                            : [...prev, cat.id]
                        );
                      }}
                    >
                      {cat.name}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="post-content">Content (Markdown)</Label>
              <Textarea
                id="post-content"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Write your post here... # Hello world"
                rows={10}
              />
            </div>

            {/* Publish */}
            <Button
              onClick={handleCreatePost}
              disabled={createPost.isPending}
              className="w-full"
              size="lg"
            >
              {createPost.isPending ? "Creating..." : "Create & Publish Post"}
            </Button>

            {/* Existing Posts */}
            <div className="pt-8 border-t">
              <h3 className="text-lg font-semibold mb-4">Existing Posts</h3>

              {!Array.isArray(postsForDashboard) ? (
                <p className="text-sm text-muted-foreground italic">Loading…</p>
              ) : postsForDashboard.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No posts yet. Create your first post above.
                </p>
              ) : (
                <ul className="space-y-3">
                  {postsForDashboard.map((post) => (
                    <li
                      key={post.id}
                      className="flex flex-col rounded border p-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="font-medium">{post.title}</div>

                        <div className="text-xs text-muted-foreground">
                          /post/{post.slug}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs">
                          {post.postsToCategories?.map(({ category }) => (
                            <span
                              key={category.id}
                              className="rounded bg-gray-200 px-2 py-0.5 text-gray-800"
                            >
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2 md:mt-0">
                        {/* Delete post */}
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletePost.isPending}
                          onClick={() => handleDeletePost(post.id, post.title)}
                        >
                          {deletePost.isPending ? "Deleting..." : "Delete"}
                        </Button>

                        {/* Placeholder for future edit UI (Priority 2/3) */}
                        {/*
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            const newTitle = prompt(
                              "New title:",
                              post.title ?? ""
                            );
                            if (!newTitle) return;
                            // here you'd call api.post.update.mutate(...)
                          }}
                        >
                          Edit
                        </Button>
                        */}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

// Wrap dashboard in TRPCReactProvider so hooks work.
// Without this you'd get "Unable to find tRPC Context".
export default function DashboardPage() {
  return (
    <TRPCReactProvider>
      <DashboardInner />
    </TRPCReactProvider>
  );
}
