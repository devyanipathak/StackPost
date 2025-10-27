"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { TRPCReactProvider, api } from "@/src/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tab";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  Plus,
  FileText,
  Tags,
  Trash2,
  Edit,
  List as ListIcon,
} from "lucide-react";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

function DashboardInner() {
  const router = useRouter();
  const utils = api.useUtils();

  //
  // ──────────────────────────────────────────────
  // State
  // ──────────────────────────────────────────────
  //

  const [activeTab, setActiveTab] = useState<"create-post" | "posts" | "categories">(
    "create-post",
  );

  // category dialogs
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // post dialogs
  const [editingPost, setEditingPost] = useState<{
    id: number;
    title: string;
    slug: string;
    content: string;
    categoryIds: number[];
  } | null>(null);

  const [postToDelete, setPostToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);

  //
  // ──────────────────────────────────────────────
  // Queries
  // ──────────────────────────────────────────────
  //

  const { data: categories, isLoading: loadingCategories } =
    api.category.getAll.useQuery();

  const {
    data: postsForDashboard,
    isLoading: loadingPosts,
  } = api.post.getAllForDashboard.useQuery();

  //
  // ──────────────────────────────────────────────
  // Form state (create category)
  // ──────────────────────────────────────────────
  //
  const [categoryName, setCategoryName] = useState("");
  const [categoryDesc, setCategoryDesc] = useState("");

  //
  // ──────────────────────────────────────────────
  // Form state (create post)
  // ──────────────────────────────────────────────
  //
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  //
  // ──────────────────────────────────────────────
  // Mutations: category
  // ──────────────────────────────────────────────
  //

  const createCategory = api.category.create.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
      setCategoryName("");
      setCategoryDesc("");
      setShowCategoryDialog(false);
    },
    onError: (err) => {
      alert(`Failed to create category: ${err.message}`);
    },
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
      setEditingCategory(null);
    },
    onError: (err) => {
      alert(`Failed to update category: ${err.message}`);
    },
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: async () => {
      await utils.category.getAll.invalidate();
      await utils.post.getAllForDashboard.invalidate();
      setCategoryToDelete(null);
    },
    onError: (err) => {
      alert(`Failed to delete category: ${err.message}`);
    },
  });

  //
  // ──────────────────────────────────────────────
  // Mutations: post
  // ──────────────────────────────────────────────
  //

  const createPost = api.post.create.useMutation({
    onSuccess: (newPost) => {
      router.push(`/post/${newPost.slug}`);
    },
    onError: (err) => {
      alert(`Error creating post: ${err.message}`);
    },
  });

  const updatePost = api.post.update.useMutation({
    onSuccess: async () => {
      await utils.post.getAllForDashboard.invalidate();
      setEditingPost(null);
    },
    onError: (err) => {
      alert(`Failed to update post: ${err.message}`);
    },
  });

  const deletePost = api.post.delete.useMutation({
    onSuccess: async () => {
      await utils.post.getAllForDashboard.invalidate();
      setPostToDelete(null);
    },
    onError: (err) => {
      alert(`Failed to delete post: ${err.message}`);
    },
  });

  //
  // ──────────────────────────────────────────────
  // Handlers: category
  // ──────────────────────────────────────────────
  //

  const handleCreateCategory = () => {
    if (!categoryName.trim()) {
      alert("Please enter a category name.");
      return;
    }
    createCategory.mutate({
      name: categoryName.trim(),
      description: categoryDesc.trim(),
    });
  };

  const handleEditCategory = (category: {
    id: number;
    name: string;
    description?: string | null;
  }) => {
    setEditingCategory({
      id: category.id,
      name: category.name,
      description: category.description || "",
    });
  };

  const handleUpdateCategory = () => {
    if (!editingCategory?.name.trim()) {
      alert("Category name cannot be empty.");
      return;
    }
    updateCategory.mutate({
      id: editingCategory.id,
      name: editingCategory.name.trim(),
      description: editingCategory.description.trim(),
    });
  };

  const handleDeleteCategory = (category: { id: number; name: string }) => {
    setCategoryToDelete(category);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory.mutate({ id: categoryToDelete.id });
    }
  };

  //
  // ──────────────────────────────────────────────
  // Handlers: post
  // ──────────────────────────────────────────────
  //

  const handleCreatePost = () => {
    if (!postTitle.trim() || selectedCategories.length === 0) {
      alert("Please add a title and select at least one category.");
      return;
    }

    createPost.mutate({
      title: postTitle.trim(),
      content: postContent,
      slug: slugify(postTitle),
      categoryIds: selectedCategories,
    });
  };

  const openEditPost = (post: any) => {
    // derive categoryIds from join
    const catIds =
      post.postsToCategories?.map(
        (rel: { categoryId: number }) => rel.categoryId,
      ) ?? [];

    setEditingPost({
      id: post.id,
      title: post.title ?? "",
      slug: post.slug ?? "",
      content: post.content ?? "",
      categoryIds: catIds,
    });
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      alert("Post title cannot be empty.");
      return;
    }
    if (!editingPost.slug.trim()) {
      alert("Slug cannot be empty.");
      return;
    }
    if (editingPost.categoryIds.length === 0) {
      alert("Select at least one category.");
      return;
    }

    updatePost.mutate({
      id: editingPost.id,
      title: editingPost.title.trim(),
      slug: editingPost.slug.trim(),
      content: editingPost.content,
      categoryIds: editingPost.categoryIds,
    });
  };

  const askDeletePost = (post: { id: number; title: string }) => {
    setPostToDelete(post);
  };

  const handleConfirmDeletePost = () => {
    if (!postToDelete) return;
    deletePost.mutate({ id: postToDelete.id });
  };

  //
  // ──────────────────────────────────────────────
  // Tabs
  // ──────────────────────────────────────────────
  //

  const handleTabChange = (value: string) => {
    const v = value as "create-post" | "posts" | "categories";
    setActiveTab(v);

    if (v === "create-post") {
      setPostTitle("");
      setPostContent("");
      setSelectedCategories([]);
    }
  };

  //
  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────
  //

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Admin Dashboard
          </h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-xl mx-auto mb-8">
            <TabsTrigger value="create-post" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Create Post
            </TabsTrigger>

            <TabsTrigger value="posts" className="flex items-center gap-2">
              <ListIcon className="h-4 w-4" />
              Posts
            </TabsTrigger>

            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Tags className="h-4 w-4" />
              Categories
            </TabsTrigger>
          </TabsList>

          {/* TAB: Create Post */}
          <TabsContent value="create-post" className="space-y-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5" />
                  Create New Post
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* left column */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="post-title">Post Title *</Label>
                      <Input
                        id="post-title"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="My Amazing Blog Post"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Categories *</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white min-h-[60px]">
                        {loadingCategories ? (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading categories...
                          </div>
                        ) : !categories || categories.length === 0 ? (
                          <span className="text-sm text-slate-500">
                            No categories available.{" "}
                            <Button
                              variant="link"
                              className="p-0 h-auto"
                              onClick={() => setActiveTab("categories")}
                            >
                              Create one first.
                            </Button>
                          </span>
                        ) : (
                          categories.map((cat) => (
                            <Badge
                              key={cat.id}
                              variant={
                                selectedCategories.includes(cat.id)
                                  ? "default"
                                  : "outline"
                              }
                              className="cursor-pointer transition-all hover:scale-105"
                              onClick={() => {
                                setSelectedCategories((prev) =>
                                  prev.includes(cat.id)
                                    ? prev.filter((id) => id !== cat.id)
                                    : [...prev, cat.id],
                                );
                              }}
                            >
                              {cat.name}
                            </Badge>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Select at least one category
                      </p>
                    </div>
                  </div>

                  {/* right column */}
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Content (Markdown)</Label>
                    <Textarea
                      id="post-content"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Write your post content here using Markdown..."
                      rows={12}
                      className="w-full font-mono text-sm"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCreatePost}
                  disabled={
                    createPost.isPending ||
                    !postTitle.trim() ||
                    selectedCategories.length === 0
                  }
                  className="w-full md:w-auto md:min-w-[200px]"
                  size="lg"
                >
                  {createPost.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Publish Post
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Posts list / edit / delete */}
          <TabsContent value="posts" className="space-y-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <ListIcon className="h-5 w-5" />
                  All Posts
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                {loadingPosts ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : !postsForDashboard || postsForDashboard.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 mb-4">
                      No posts yet. Create your first post.
                    </p>
                    <Button onClick={() => setActiveTab("create-post")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {postsForDashboard.map((post) => (
                      <Card
                        key={post.id}
                        className="relative group hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="pr-8">
                              <h3 className="font-semibold text-lg line-clamp-1">
                                {post.title || "(untitled)"}
                              </h3>
                              <p className="text-xs text-slate-500 break-all">
                                /post/{post.slug}
                              </p>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Edit button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditPost(post)}
                                disabled={
                                  updatePost.isPending &&
                                  updatePost.variables?.id === post.id
                                }
                              >
                                {updatePost.isPending &&
                                updatePost.variables?.id === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </Button>

                              {/* Delete button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  askDeletePost({
                                    id: post.id,
                                    title: post.title ?? "",
                                  })
                                }
                                disabled={
                                  deletePost.isPending &&
                                  deletePost.variables?.id === post.id
                                }
                              >
                                {deletePost.isPending &&
                                deletePost.variables?.id === post.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* category badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.postsToCategories?.map(
                              (rel: {
                                category: { id: number; name: string };
                              }) => (
                                <Badge key={rel.category.id} variant="outline">
                                  {rel.category.name}
                                </Badge>
                              ),
                            )}
                          </div>

                          {/* content preview */}
                          {post.content && (
                            <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">
                              {post.content}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Categories */}
          <TabsContent value="categories" className="space-y-6">
            <Card>
              <CardHeader className="bg-slate-50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Tags className="h-5 w-5" />
                    Categories Management
                  </CardTitle>
                  <Button
                    onClick={() => setShowCategoryDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    New Category
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {loadingCategories ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : !categories || categories.length === 0 ? (
                  <div className="text-center py-8">
                    <Tags className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p className="text-slate-500 mb-4">
                      No categories yet. Create your first category!
                    </p>
                    <Button onClick={() => setShowCategoryDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <Card
                        key={category.id}
                        className="relative group hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg pr-8">
                              {category.name}
                            </h3>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCategory(category)}
                                disabled={
                                  updateCategory.isPending &&
                                  updateCategory.variables?.id ===
                                    category.id
                                }
                              >
                                {updateCategory.isPending &&
                                updateCategory.variables?.id ===
                                  category.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category)
                                }
                                disabled={
                                  deleteCategory.isPending &&
                                  deleteCategory.variables?.id ===
                                    category.id
                                }
                              >
                                {deleteCategory.isPending &&
                                deleteCategory.variables?.id ===
                                  category.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {category.description && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/*
        ──────────────────────────────────────────────
        CATEGORY DIALOGS
        ──────────────────────────────────────────────
        */}

        {/* New Category */}
        <Dialog
          open={showCategoryDialog}
          onOpenChange={setShowCategoryDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your blog posts.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name *</Label>
                <Input
                  id="category-name"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g., Technology, Lifestyle, Tutorials"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Textarea
                  id="category-description"
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  placeholder="Brief description of this category..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCategory}
                disabled={
                  createCategory.isPending || !categoryName.trim()
                }
              >
                {createCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category */}
        <Dialog
          open={!!editingCategory}
          onOpenChange={() => setEditingCategory(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update the category name and description.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category-name">
                  Category Name *
                </Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory?.name || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev ? { ...prev, name: e.target.value } : null,
                    )
                  }
                  placeholder="Category name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category-description">
                  Description
                </Label>
                <Textarea
                  id="edit-category-description"
                  value={editingCategory?.description || ""}
                  onChange={(e) =>
                    setEditingCategory((prev) =>
                      prev
                        ? { ...prev, description: e.target.value }
                        : null,
                    )
                  }
                  placeholder="Category description"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateCategory}
                disabled={
                  updateCategory.isPending ||
                  !editingCategory?.name.trim()
                }
              >
                {updateCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category */}
        <Dialog
          open={!!categoryToDelete}
          onOpenChange={() => setCategoryToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "
                {categoryToDelete?.name}"? Posts won't be deleted, but
                they'll lose this category.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCategoryToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeleteCategory}
                disabled={deleteCategory.isPending}
              >
                {deleteCategory.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/*
        ──────────────────────────────────────────────
        POST DIALOGS
        ──────────────────────────────────────────────
        */}

        {/* Edit Post */}
        <Dialog
          open={!!editingPost}
          onOpenChange={() => setEditingPost(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Post</DialogTitle>
              <DialogDescription>
                Update title, slug, content, and categories.
              </DialogDescription>
            </DialogHeader>

            {editingPost && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-post-title">Title *</Label>
                  <Input
                    id="edit-post-title"
                    value={editingPost.title}
                    onChange={(e) =>
                      setEditingPost((prev) =>
                        prev
                          ? { ...prev, title: e.target.value }
                          : null,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-post-slug">Slug *</Label>
                  <Input
                    id="edit-post-slug"
                    value={editingPost.slug}
                    onChange={(e) =>
                      setEditingPost((prev) =>
                        prev
                          ? { ...prev, slug: e.target.value }
                          : null,
                      )
                    }
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500">
                    URL will be /post/{editingPost.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-post-content">Content</Label>
                  <Textarea
                    id="edit-post-content"
                    value={editingPost.content}
                    onChange={(e) =>
                      setEditingPost((prev) =>
                        prev
                          ? { ...prev, content: e.target.value }
                          : null,
                      )
                    }
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-white min-h-[60px]">
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading categories...
                      </div>
                    ) : !categories || categories.length === 0 ? (
                      <span className="text-sm text-slate-500">
                        No categories available.
                      </span>
                    ) : (
                      categories.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant={
                            editingPost.categoryIds.includes(cat.id)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer transition-all hover:scale-105"
                          onClick={() => {
                            setEditingPost((prev) => {
                              if (!prev) return prev;
                              const exists = prev.categoryIds.includes(
                                cat.id,
                              );
                              return {
                                ...prev,
                                categoryIds: exists
                                  ? prev.categoryIds.filter(
                                      (id) => id !== cat.id,
                                    )
                                  : [...prev.categoryIds, cat.id],
                              };
                            });
                          }}
                        >
                          {cat.name}
                        </Badge>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Keep at least one category.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingPost(null)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePost}
                disabled={
                  updatePost.isPending ||
                  !editingPost?.title.trim() ||
                  !editingPost?.slug.trim() ||
                  editingPost?.categoryIds.length === 0
                }
              >
                {updatePost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Post */}
        <Dialog
          open={!!postToDelete}
          onOpenChange={() => setPostToDelete(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Post</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "
                {postToDelete?.title}"? This cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setPostToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDeletePost}
                disabled={deletePost.isPending}
              >
                {deletePost.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Post"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <TRPCReactProvider>
      <DashboardInner />
    </TRPCReactProvider>
  );
}
