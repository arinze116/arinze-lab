import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "./card";
import { Badge } from "./badge";
import { WritingMeta } from "@/types/content";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function WritingCard({ post }: { post: WritingMeta }) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <Badge>{post.category}</Badge>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {post.readingTime}
        </span>
      </div>
      <h3 className="text-lg font-semibold">{post.title}</h3>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {post.description}
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(post.date)}
        </span>
        <Link
          href={`/writing/${post.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-accent)] hover:underline underline-offset-4"
        >
          Read Article <ArrowUpRight size={14} />
        </Link>
      </div>
    </Card>
  );
}
