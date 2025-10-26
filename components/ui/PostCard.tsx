"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


type PostCardProps = {
  href: string;
  title: string;
  preview: string;
  categories: string[];
};

export default function PostCard({
  href,
  title,
  preview,
  categories,
}: PostCardProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <div className="relative">
      {/* overlay spinner when navigating */}
      {isNavigating && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
              Loading…
            </span>
          </div>
        </div>
      )}

      <Link
        href={href}
        onClick={() => {
          setIsNavigating(true);
        }}
        className="block"
      >
        <Card
          className={[
            "relative h-full cursor-pointer rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800",
            "transition-all duration-150",
            "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-[1px]",
          ].join(" ")}
        >
          <CardHeader className="space-y-2">
            <CardTitle className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </CardTitle>

            <CardDescription className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-2">
              {preview}…
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="rounded-full bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 text-[11px] font-medium px-2 py-1"
                >
                  {cat}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end">
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">
                Read more →
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
